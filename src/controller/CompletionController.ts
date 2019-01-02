import { isNil, isNumber, isString } from 'lodash';
import { BaseError, Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotFoundError } from 'src/error/NotFoundError';
import { Listener } from 'src/listener/Listener';
import { Parser } from 'src/parser/Parser';
import { ServiceMetadata } from 'src/Service';
import { mapToDict } from 'src/utils/Map';

export const NOUN_FRAGMENT = 'fragment';

export interface CompletionControllerData extends ControllerData {
  defaultTarget: ServiceMetadata;
}

export type CompletionControllerOptions = ControllerOptions<CompletionControllerData>;

@Inject('storage')
export class CompletionController extends BaseController<CompletionControllerData> implements Controller {
  protected readonly storage: Connection;
  protected readonly fragmentRepository: Repository<Fragment>;
  protected target: Listener;

  constructor(options: CompletionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-completion', [NOUN_FRAGMENT]);

    this.storage = options.storage;
    this.fragmentRepository = this.storage.getRepository(Fragment);
  }

  public async start() {
    await super.start();

    this.target = this.services.getService(this.data.defaultTarget);
  }

  @HandleNoun(NOUN_FRAGMENT)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createFragment(cmd: Command): Promise<void> {
    const user = this.getUserOrFail(cmd.context);
    const key = cmd.getHead('key');
    const msg = cmd.getHeadOrDefault('msg', `missing required argument: ${key}`);
    const noun = cmd.getHead('noun');
    const parserId = cmd.getHead('parser');
    const verb = cmd.getHead('verb') as CommandVerb;

    const fragment = await this.fragmentRepository.save(new Fragment({
      data: cmd.data,
      key,
      labels: cmd.labels,
      noun,
      parserId,
      userId: user.id,
      verb,
    }));

    const context = await this.createContext(cmd.context);
    this.logger.debug({ context, fragment }, 'creating fragment for later completion');
    return this.reply(context, `${fragment.id} (${key}): ${msg}`);
  }

  @HandleNoun(NOUN_FRAGMENT)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
  public async updateFragment(cmd: Command): Promise<void> {
    const id = cmd.getHead('id');
    this.logger.debug({ id }, 'getting fragment to complete');

    const fragment = await this.getFragment(cmd.context, id);
    if (isNil(fragment)) {
      return this.reply(cmd.context, 'fragment not found');
    }

    this.logger.debug({ fragment, parserId: fragment.parserId }, 'attempting to complete fragment');

    try {
      const parser = this.services.getService<Parser>({ id: fragment.parserId });
      const value = cmd.get('next');
      const commands = await parser.complete(cmd.context, fragment, value);

      // the commands have been completed (or additional completions issued), so even if they fail,
      // the previous fragment should be cleaned up. If parsing fails, the fragment should not be
      // cleaned up.
      await this.fragmentRepository.delete(fragment.id);
      await this.bot.executeCommand(...commands);
    } catch (err) {
      this.logger.error(err, 'error completing fragment');
      return this.reply(cmd.context, 'error completing fragment');
    }
  }

  protected async createContext(ctx: Context) {
    if (isNil(ctx.target)) {
      return ctx.extend({
        target: this.target,
      });
    } else {
      return ctx;
    }
  }

  protected async getFragment(ctx: Context, id: string): Promise<Fragment> {
    const user = this.getUserOrFail(ctx);
    if (id === 'last') {
      const results = await this.fragmentRepository.find({
        order: {
          createdAt: 'DESC',
        } as any,
        take: 1,
        where: {
          userId: user.id,
        },
      });

      if (results.length > 0) {
        return results[0];
      } else {
        throw new NotFoundError();
      }
    } else {
      return this.fragmentRepository.findOneOrFail({
        id,
      });
    }
  }
}

export function createCompletion(cmd: Command, key: string, msg: string): Command {
  if (isNil(cmd.context.parser)) {
    throw new InvalidArgumentError('command has no parser to prompt for completion');
  }

  const existingData = mapToDict(cmd.data);
  return new Command({
    context: cmd.context,
    data: {
      ...existingData,
      key: [key],
      msg: [msg],
      noun: [cmd.noun],
      parser: [cmd.context.parser.id],
      verb: [cmd.verb],
    },
    labels: {},
    noun: NOUN_FRAGMENT,
    verb: CommandVerb.Create,
  });
}

type CollectData = number | string | Array<string>;

interface CollectFields {
  [key: string]: CollectData;
}

interface CollectInputKey<TData extends CollectData> {
  default: TData;
  prompt: string;
  required: boolean;
}

type CollectInput<TData extends CollectFields> = {
  [K in keyof TData]: CollectInputKey<TData[K]>;
};

interface CompleteCollectResult<TData> {
  complete: true;
  data: TData;
}

interface IncompleteCollectResult<TData> {
  complete: false;
  fragment: Command;
}

type CollectResult<TData> = CompleteCollectResult<TData> | IncompleteCollectResult<TData>;

export function collectOrComplete<TData extends CollectFields>(cmd: Command, fields: CollectInput<TData>): CollectResult<TData> {
  const results = new Map<string, CollectData>();
  for (const [key, def] of Object.entries(fields)) {
    const exists = cmd.has(key);
    if (def.required && !exists) {
      return {
        complete: false,
        fragment: createCompletion(cmd, key, def.prompt),
      };
    }

    if (exists) {
      const value = cmd.get(key);
      const coerced = collectValue(value, def.default);
      if (isNil(coerced)) {
        return {
          complete: false,
          fragment: createCompletion(cmd, key, def.prompt),
        };
      }
      results.set(key, coerced);
    } else {
      results.set(key, def.default);
    }
  }

  return {
    complete: true,
    data: mapToDict(results) as TData,
  };
}

export function collectValue(value: CollectData, defaultValue: CollectData): CollectData | undefined {
  if (Array.isArray(defaultValue)) {
    if (Array.isArray(value)) {
      return value;
    }

    if (isNumber(value)) {
      return [value.toString(10)];
    }

    if (isString(value)) {
      return [value];
    }
  }

  if (isNumber(defaultValue)) {
    if (Array.isArray(value)) {
      const [head] = value;
      return parseInt(head, 10);
    }

    if (isNumber(value)) {
      return value;
    }

    if (isString(value)) {
      return parseInt(value, 10);
    }
  }

  if (isString(defaultValue)) {
    if (Array.isArray(value)) {
      const [head] = value;
      return head;
    }

    if (isNumber(value)) {
      return value.toString(10);
    }

    if (isString(value)) {
      return value;
    }
  }

  throw new BaseError('value type error');
}

import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Connection, Repository } from 'typeorm';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { NotFoundError } from 'src/error/NotFoundError';
import { Listener } from 'src/listener/Listener';
import { Parser } from 'src/parser/Parser';
import { ServiceMetadata } from 'src/Service';

export const NOUN_FRAGMENT = 'fragment';

export interface CompletionControllerData extends ControllerData {
  defaultTarget: ServiceMetadata;
}

export type CompletionControllerOptions = ControllerOptions<CompletionControllerData>;

@Inject('storage')
export class CompletionController extends BaseController<CompletionControllerData> implements Controller {
  protected readonly storage: Connection;
  protected readonly fragmentRepository: Repository<Fragment>;
  protected target?: Listener;

  constructor(options: CompletionControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-completion', [NOUN_FRAGMENT]);

    this.storage = options.storage;
    this.fragmentRepository = this.storage.getRepository(Fragment);
  }

  public async start() {
    await super.start();

    this.target = this.services.getService<Listener>(this.data.defaultTarget);
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

    const fragment = new Fragment();
    fragment.data = cmd.data;
    fragment.key = key;
    fragment.labels = cmd.labels;
    fragment.noun = noun;
    fragment.parserId = parserId;
    fragment.userId = user.id;
    fragment.verb = verb;

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

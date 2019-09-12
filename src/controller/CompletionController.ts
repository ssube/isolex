import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from '../BotService';
import { CheckRBAC, Controller, ControllerData, Handler } from '../controller';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Fragment } from '../entity/Fragment';
import { NotFoundError } from '../error/NotFoundError';
import { Listener } from '../listener';
import { Parser } from '../parser';
import { ServiceMetadata } from '../Service';
import { mustExist } from '../utils';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_FRAGMENT = 'fragment';

export interface CompletionControllerData extends ControllerData {
  defaultTarget: ServiceMetadata;
}

@Inject(INJECT_STORAGE)
export class CompletionController extends BaseController<CompletionControllerData> implements Controller {
  protected readonly fragmentRepository: Repository<Fragment>;
  protected target?: Listener;

  constructor(options: BaseControllerOptions<CompletionControllerData>) {
    super(options, 'isolex#/definitions/service-controller-completion', [NOUN_FRAGMENT]);

    this.fragmentRepository = mustExist(options[INJECT_STORAGE]).getRepository(Fragment);
  }

  public async start() {
    await super.start();

    this.target = this.services.getService<Listener>(this.data.defaultTarget);
  }

  @Handler(NOUN_FRAGMENT, CommandVerb.Create)
  @CheckRBAC()
  public async createFragment(cmd: Command, ctx: Context): Promise<void> {
    const user = this.getUserOrFail(ctx);
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
      userId: mustExist(user.id),
      verb,
    }));

    this.logger.debug({ ctx, fragment }, 'creating fragment for later completion');
    return this.reply(ctx, this.translate(ctx, 'create.prompt', {
      id: fragment.id,
      key,
      msg,
    }));
  }

  @Handler(NOUN_FRAGMENT, CommandVerb.Update)
  @CheckRBAC()
  public async updateFragment(cmd: Command, ctx: Context): Promise<void> {
    const id = cmd.getHead('id');
    this.logger.debug({ id }, 'getting fragment to complete');

    const fragment = await this.getFragment(ctx, id);
    if (isNil(fragment)) {
      return this.reply(ctx, this.translate(ctx, 'update.missing'));
    }

    this.logger.debug({ fragment, parserId: fragment.parserId }, 'attempting to complete fragment');

    const parser = this.services.getService<Parser>({ id: fragment.parserId });
    const value = cmd.get('next');
    const commands = await parser.complete(ctx, fragment, value);

    // the commands have been completed (or additional completions issued), so even if they fail,
    // the previous fragment should be cleaned up. If parsing fails, the fragment should not be
    // cleaned up.
    await this.fragmentRepository.delete(mustExist(fragment.id));
    await this.bot.executeCommand(...commands);
  }

  @Handler(NOUN_FRAGMENT, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }

  protected async createContext(maybeCtx?: Context) {
    const ctx = mustExist(maybeCtx);
    if (isNil(ctx.target)) {
      return new Context({
        ...ctx,
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
          /* tslint:disable-next-line:no-any */
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

import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { FetchOptions, Listener, ListenerData } from '.';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { User } from '../entity/auth/User';
import { Context, ContextOptions } from '../entity/Context';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { doesExist, mustExist } from '../utils';

export type BaseListenerOptions<TData extends ListenerData> = BotServiceOptions<TData>;

@Inject(INJECT_STORAGE)
export abstract class BaseListener<TData extends ListenerData> extends BotService<TData> implements Listener {
  protected readonly contextRepository: Repository<Context>;

  constructor(options: BaseListenerOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.contextRepository = mustExist(options[INJECT_STORAGE]).getRepository(Context);
  }

  /**
   * Check if this listener can receive messages from this context.
   *
   * Defaults to checking that the context came from this very same listener, by id.
   */
  public async check(msg: Message): Promise<boolean> {
    const ctx = mustExist(msg.context);
    if (doesExist(ctx.target)) {
      return ctx.target.id === this.id;
    }

    return false;
  }

  public abstract send(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public abstract createSession(uid: string, user: User): Promise<Session>;
  public abstract getSession(uid: string): Promise<Session | undefined>;

  protected async createContext(options: ContextOptions): Promise<Context> {
    const ctx = await this.contextRepository.save(new Context({
      ...options,
      source: this,
      target: this,
    }));
    this.logger.debug({ ctx }, 'listener saved new context');
    return ctx;
  }
}

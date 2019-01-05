import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { BotService } from 'src/BotService';
import { User } from 'src/entity/auth/User';
import { Context, ContextOptions } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { FetchOptions, Listener, ListenerData, ListenerOptions } from 'src/listener/Listener';
import { doesExist, mustExist } from 'src/utils';

@Inject('storage')
export abstract class BaseListener<TData extends ListenerData> extends BotService<TData> implements Listener {
  protected readonly contextRepository: Repository<Context>;

  constructor(options: ListenerOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.contextRepository = options.storage.getRepository(Context);
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

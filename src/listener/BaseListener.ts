import { BotService } from 'src/BotService';
import { User } from 'src/entity/auth/User';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { FetchOptions, Listener, ListenerData } from 'src/listener/Listener';

export abstract class BaseListener<TData extends ListenerData> extends BotService<TData> implements Listener {
  /**
   * Check if this listener can receive messages from this context.
   *
   * Defaults to checking that the context came from this very same listener, by id.
   */
  public async check(msg: Message): Promise<boolean> {
    if (msg.context.target) {
      return msg.context.target.id === this.id;
    }

    if (msg.context.source) {
      return msg.context.source.id === this.id;
    }

    return false;
  }

  public abstract send(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;

  public abstract createSession(uid: string, user: User): Promise<Session>;
  public abstract getSession(uid: string): Promise<Session | undefined>;
}

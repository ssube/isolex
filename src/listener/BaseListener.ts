import { ChildService } from 'src/ChildService';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { FetchOptions, Listener } from 'src/listener/Listener';

export abstract class BaseListener<TData> extends ChildService<TData> implements Listener {
  /**
   * Check if this listener can receive messages from this context.
   *
   * Defaults to checking that the context came from this very same listener, by id.
   */
  public async check(context: Context): Promise<boolean> {
    return context.listenerId === this.id;
  }

  public abstract emit(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public async receive(value: Message) {
    return this.bot.receive(value);
  }

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;
}

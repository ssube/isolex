import { BaseService } from 'src/BaseService';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { FetchOptions, Listener } from 'src/listener/Listener';

export abstract class BaseListener<TData> extends BaseService<TData> implements Listener {
  /**
   * @TODO implement this for real
   */
  public async check(context: Context): Promise<boolean> {
    return true;
  }

  public abstract emit(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public async receive(value: Message) {
    return this.bot.receive(value);
  }

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;
}

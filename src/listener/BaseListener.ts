import { Context } from 'src/Context';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { Message } from 'src/Message';
import { BaseService } from 'src/Service';

export abstract class BaseListener<TConfig> extends BaseService<TConfig> implements Listener {
  /**
   * @todo implement this for real
   */
  public async check(context: Context): Promise<boolean> {
    return true;
  }

  public abstract emit(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public abstract receive(event: any): Promise<void>;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;
}

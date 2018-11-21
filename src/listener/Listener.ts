import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Service } from 'src/Service';

export interface FetchOptions {
  after?: boolean;
  before?: boolean;
  channel: string;
  count?: number;
  id?: string;
}

export interface ContextFetchOptions extends FetchOptions {
  listenerId: string;
  useFilters: boolean;
}

export interface Listener extends Service {
  check(context: Context): Promise<boolean>;

  /**
   * Emit a message.
   */
  emit(msg: Message): Promise<void>;

  /**
   * Fetch some messages.
   */
  fetch(options: FetchOptions): Promise<Array<Message>>;

  /**
   * Receive an incoming event and pass it on to the bot.
   */
  receive(msg: Message): Promise<void>;
}

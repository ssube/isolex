import { Command } from 'src/Command';
import { Message } from 'src/Message';
import { Service } from 'src/Service';

export interface FetchOptions {
  after?: boolean;
  before?: boolean;
  channel: string;
  count?: number;
  id?: string;
}

export interface Listener extends Service {
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
  receive(event: any): Promise<void>;
}

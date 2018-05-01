import { Command } from 'src/Command';
import { Message } from 'src/Message';
import { Service } from 'src/Service';

export interface Listener extends Service {
  /**
   * Emit a message.
   */
  emit(msg: Message): Promise<void>;

  /**
   * Receive an incoming event and pass it on to the bot.
   * 
   * Specific listeners should specialize this.
   */
  receive(event: any): Promise<void>;
}

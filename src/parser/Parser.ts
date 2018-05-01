import { Command } from 'src/Command';
import { Message } from 'src/Message';

/**
 * Parse incoming events into valid commands for the bot to handle.
 */
export interface Parser {
  /**
   * Check whether this parser can parse an event (has the correct type, tags, etc).
   * @param msg the incoming message to be parsed
   */
  match(msg: Message): Promise<boolean>;

  /**
   * Parse an event into commands.
   */
  parse(msg: Message): Promise<Array<Command>>;
}
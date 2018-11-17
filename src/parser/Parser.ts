import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Service } from 'src/Service';
import { Fragment } from 'src/entity/Fragment';

export interface ParserConfig {
  tags: Array<string>;
}

/**
 * Parse incoming events into valid commands for the bot to handle.
 */
export interface Parser extends Service {
  /**
   * Check whether this parser can parse an event (has the correct type, tags, etc).
   * @param msg the incoming message to be parsed
   */
  match(msg: Message): Promise<boolean>;

  /**
   * Parse an event into commands.
   */
  parse(msg: Message): Promise<Array<Command>>;

  /**
   * Complete a command from an existing fragment and new value.
   */
  complete(frag: Fragment, value: string): Promise<Array<Command>>;
}

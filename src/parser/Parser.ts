import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Service } from 'src/Service';
import { Fragment } from 'src/entity/Fragment';

export interface ParserData {
  emit: {
    noun: string;
    verb: CommandVerb;
  }
  tags: Array<string>;
}

export type ParserValue = Buffer | string;

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
   * Parse the body of an event into structured data. Binary data should be passed as a buffer or base64-encoded
   * string, text data should be passed as a string.
   * 
   * If the MIME type is not one this parser can handle, it should throw.
   * 
   * This allows access to the parser's data for use by transforms.
   */
  decode(msg: Message): Promise<any>;

  /**
   * Complete a command from an existing fragment and new value.
   */
  complete(frag: Fragment, value: string): Promise<Array<Command>>;
}

import { ChildServiceOptions } from 'src/ChildService';
import { Command, CommandDataValue, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Service } from 'src/Service';
import { MatchData } from 'src/utils/match';

export interface ParserOutputData extends CommandOptions {
}

export interface ParserData {
  /**
   * Default command options.
   */
  defaultCommand: CommandOptions;
  /**
   * Prefer fields from data over those in the default command.
   */
  preferData: boolean;
  /**
   * Match only certain messages.
   */
  match: MatchData;
}

export type ParserOptions<TData extends ParserData> = ChildServiceOptions<TData>;

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
  complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>>;
}

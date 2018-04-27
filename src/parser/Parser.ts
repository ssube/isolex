import { Command } from 'src/Command';
import { Event } from 'vendor/so-client/src/events';

/**
 * Parse incoming events into valid commands for the bot to handle.
 */
export interface Parser {
  /**
   * Check whether this parser can parse an event (has the correct type, tags, etc).
   * @param event the event to be parsed
   */
  match(event: Event): Promise<boolean>;

  /**
   * Parse an event into commands.
   */
  parse(event: Event): Promise<Array<Command>>;
}
import { Command } from 'src/Command';
import { ServiceOptions } from 'src/Service';

export type HandlerOptions<T> = ServiceOptions<T>;

/**
 * Handlers react to commands, consuming them before sending replies or performing background work.
 */
export interface Handler {
  /**
   * Handle a command, sending any replies.
   * @param cmd the command to be handled
   * @returns true if the command was handled
   */
  handle(cmd: Command): Promise<boolean>;
}

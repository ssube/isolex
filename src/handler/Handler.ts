import { Command } from 'src/command/Command';

export interface Handler {
  /**
   * Handle a command, sending any replies.
   * @param cmd the command to be handled
   * @returns true if the command was handled
   */
  handle(cmd: Command): Promise<boolean>;
}
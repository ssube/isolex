import { Command } from 'src/entity/Command';
import { Service, ServiceOptions } from 'src/Service';

export interface HandlerConfig {
  name: string;
}

export type HandlerOptions<T> = ServiceOptions<T>;

/**
 * Handlers react to commands, consuming them before sending replies or performing background work.
 */
export interface Handler extends Service {
  check(cmd: Command): Promise<boolean>;

  /**
   * Handle a command, sending any replies.
   * @param cmd the command to be handled
   * @returns true if the command was handled
   */
  handle(cmd: Command): Promise<void>;
}

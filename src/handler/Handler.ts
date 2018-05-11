import { Command } from 'src/entity/Command';
import { Service, ServiceConfig, ServiceOptions } from 'src/Service';

export type HandlerConfig = ServiceConfig;
export type HandlerOptions<T extends HandlerConfig> = ServiceOptions<T>;

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

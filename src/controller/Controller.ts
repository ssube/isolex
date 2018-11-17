import { Command } from 'src/entity/Command';
import { Service, ServiceOptions } from 'src/Service';

export type ControllerConfig = {};
export type ControllerOptions<T extends ControllerConfig> = ServiceOptions<T>;

/**
 * Controllers react to commands, consuming them before sending replies or performing background work.
 */
export interface Controller extends Service {
  check(cmd: Command): Promise<boolean>;

  /**
   * Handle a command, sending any replies.
   * @param cmd the command to be handled
   * @returns true if the command was handled
   */
  handle(cmd: Command): Promise<void>;
}

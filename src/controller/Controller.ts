import { Command } from 'src/entity/Command';
import { Service, ServiceOptions, ServiceDefinition } from 'src/Service';
import { TransformConfig } from 'src/transform/Transform';

export interface ControllerConfig {
  transforms: Array<ServiceDefinition<TransformConfig>>;
}

export type ControllerOptions<TData extends ControllerConfig> = ServiceOptions<TData>;

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

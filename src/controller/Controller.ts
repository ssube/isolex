import { BotServiceOptions } from 'src/BotService';
import { Command } from 'src/entity/Command';
import { FilterData } from 'src/filter/Filter';
import { Service, ServiceDefinition } from 'src/Service';
import { TransformData } from 'src/transform/Transform';

export interface ControllerData {
  filters: Array<ServiceDefinition<FilterData>>;
  transforms: Array<ServiceDefinition<TransformData>>;
}

export type ControllerOptions<TData extends ControllerData> = BotServiceOptions<TData>;

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

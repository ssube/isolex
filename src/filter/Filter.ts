import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Service } from 'src/Service';

export enum FilterBehavior {
  /**
   * Drop the entity and skip any further processing.
   */
  Drop = 0x00, 

  /**
   * Allow the entity and perform full processing.
   */
  Allow = 0x80,

  /**
   * Ignore the entity, providing no opinion on what should be done with it.
   */
  Ignore = 0xFF
}

export type FilterValue = Command | Message;

/**
 * Filters take commands, incoming events, and messages to determine if they should continue through the system or
 * be discarded.
 */
export interface Filter extends Service {
  filter(val: FilterValue): Promise<FilterBehavior>;
}

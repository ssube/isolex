import { Command } from 'src/Command';
import { Message } from 'src/Message';

export enum FilterBehavior {
  Drop = 0x00,
  Allow = 0x80
}

export type FilterValue = Command | Message;

/**
 * Filters take commands, incoming events, and messages to determine if they should continue through the system or
 * be discarded.
 */
export interface Filter {
  filter(val: FilterValue): Promise<FilterBehavior>;
}

import { Command } from 'src/command/Command';
import { Message } from 'src/Message';
import { Event } from 'vendor/so-client/src/events';

export enum FilterBehavior {
  Drop = 0x00,
  Allow = 0x80
}

export type FilterValue = Command | Event | Message;

export interface Filter {
  filter(val: FilterValue): Promise<FilterBehavior>;
}

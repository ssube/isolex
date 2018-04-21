import { Command } from 'src/command/Command';
import { Event } from 'vendor/so-client/src/events';

export interface Parser {
  match(event: Event): Promise<boolean>;
  parse(event: Event): Promise<Command>;
}
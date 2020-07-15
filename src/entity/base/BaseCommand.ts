import { Dict, doesExist, getHeadOrDefault } from '@apextoaster/js-utils';
import { Column } from 'typeorm';

import { DataEntity, DataEntityOptions } from '../base/DataEntity';

export type CommandValue = Array<string>;
export type CommandData = Dict<CommandValue>;

export enum CommandVerb {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  Help = 'help',
  List = 'list',
  Update = 'update',
}

export interface BaseCommandOptions extends DataEntityOptions<CommandValue> {
  noun: string;
  verb: CommandVerb;
}

export abstract class BaseCommand extends DataEntity<CommandValue> {
  @Column({
    type: 'varchar',
  })
  public noun = '';

  @Column()
  public verb: CommandVerb = CommandVerb.Help;

  constructor(options: BaseCommandOptions) {
    super(options);

    if (doesExist(options)) {
      this.noun = options.noun;
      this.verb = options.verb;
    }
  }

  public getHead(key: string): string {
    const value = this.get(key);
    return value[0];
  }

  public getNumber(key: string): number {
    return Number(this.getHead(key));
  }

  public getHeadOrDefault(key: string, defaultValue: string): string {
    return getHeadOrDefault(this.data, key, defaultValue);
  }

  public getHeadOrNumber(key: string, defaultValue: number): number {
    if (this.has(key)) {
      const value = this.getHead(key);
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      if (isNaN(value as any)) {
        return defaultValue;
      } else {
        return Number(value);
      }
    } else {
      return defaultValue;
    }
  }

  public abstract toJSON(): object;
}

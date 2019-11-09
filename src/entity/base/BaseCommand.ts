import { Column } from 'typeorm';

import { CommandVerb } from '../../entity/Command';
import { doesExist } from '../../utils';
import { Dict, getHeadOrDefault } from '../../utils/Map';
import { DataEntity, DataEntityOptions } from '../base/DataEntity';

export type CommandValue = Array<string>;
export type CommandData = Dict<CommandValue>;

export interface BaseCommandOptions extends DataEntityOptions<CommandValue> {
  noun: string;
  verb: CommandVerb;
}

export abstract class BaseCommand extends DataEntity<CommandValue> {
  @Column()
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

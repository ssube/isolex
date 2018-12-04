import { Column } from 'typeorm';

import { DataEntity } from 'src/entity/base/DataEntity';
import { CommandVerb } from 'src/entity/Command';
import { getHeadOrDefault } from 'src/utils';

export abstract class BaseCommand extends DataEntity<Array<string>> {
  @Column()
  public noun: string;

  @Column()
  public verb: CommandVerb;

  public getHead(key: string): string {
    const value = this.get(key);
    return value[0];
  }

  public getHeadOrDefault(key: string, defaultValue: string): string {
    return getHeadOrDefault(this.data, key, defaultValue);
  }

  public abstract toJSON(): object;
}

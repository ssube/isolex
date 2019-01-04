import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { BaseCommand } from 'src/entity/base/BaseCommand';
import { CommandOptions } from 'src/entity/Command';
import { dictToMap } from 'src/utils/Map';

export interface KeywordOptions extends CommandOptions {
  controllerId: string;

  /**
   * The keyword to execute with.
   */
  key: string;
}

export const TABLE_KEYWORD = 'keyword';

@Entity(TABLE_KEYWORD)
export class Keyword extends BaseCommand implements KeywordOptions {
  @Column()
  public controllerId: string = '';

  @PrimaryGeneratedColumn('uuid')
  public id: string = '';

  @PrimaryColumn()
  public key: string = '';

  public toJSON() {
    return {
      controllerId: this.controllerId,
      id: this.id,
      key: this.key,
      noun: this.noun,
      verb: this.verb,
    };
  }
}

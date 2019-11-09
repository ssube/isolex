import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { doesExist } from '../../utils';
import { BaseCommand } from '../base/BaseCommand';
import { CommandOptions } from '../Command';

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
  @Column({
    type: 'varchar',
  })
  public controllerId = '';

  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @PrimaryColumn({
    type: 'varchar',
  })
  public key = '';

  constructor(options: KeywordOptions) {
    super(options);

    if (doesExist(options)) {
      this.controllerId = options.controllerId;
      this.key = options.key;
    }
  }

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

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
  public controllerId: string;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @PrimaryColumn()
  public key: string;

  constructor(options?: KeywordOptions) {
    super();

    if (options) {
      this.controllerId = options.controllerId;
      this.data = dictToMap(options.data);
      this.key = options.key;
      this.labels = dictToMap(options.labels);
      this.noun = options.noun;
      this.verb = options.verb;
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

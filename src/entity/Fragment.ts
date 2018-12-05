import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { dictToMap } from 'src/utils/Map';

import { BaseCommand } from './base/BaseCommand';
import { CommandOptions } from './Command';

export interface FragmentOptions extends CommandOptions {
  /**
   * The next key to be filled.
   *
   * For the Lex parser, this is a slot within the intent (noun).
   */
  key: string;

  parserId: string;
}

@Entity()
export class Fragment extends BaseCommand implements FragmentOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

  @Column()
  public parserId: string;

  constructor(options?: FragmentOptions) {
    super(options);

    if (options) {
      this.data = dictToMap(options.data);
      this.key = options.key;
      this.labels = dictToMap(options.labels);
      this.noun = options.noun;
      this.parserId = options.parserId;
      this.verb = options.verb;
    }
  }

  public toJSON() {
    return {
      data: this.data,
      id: this.id,
      key: this.key,
      noun: this.noun,
      parserId: this.parserId,
      verb: this.verb,
    };
  }
}

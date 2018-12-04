import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { dictToMap } from 'src/utils';

import { BaseCommand } from './base/BaseCommand';
import { CommandData } from './Command';

export interface FragmentOptions extends CommandData {
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
  public static create(options: FragmentOptions) {
    const fragment = new Fragment();
    fragment.data = dictToMap(options.data);
    fragment.key = options.key;
    fragment.labels = dictToMap(options.labels);
    fragment.noun = options.noun;
    fragment.parserId = options.parserId;
    fragment.verb = options.verb;
    return fragment;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

  @Column()
  public parserId: string;

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

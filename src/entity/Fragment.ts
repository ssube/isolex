import { Column, PrimaryGeneratedColumn, AfterLoad, BeforeInsert, BeforeUpdate, Entity } from 'typeorm';

import { dictToMap } from 'src/utils';

import { BaseEntity } from './BaseEntity';
import { CommandData, CommandDataType, CommandVerb } from './Command';

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
export class Fragment extends BaseEntity implements FragmentOptions {
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

  public data: CommandDataType;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

  public labels: Map<string, string>;

  @Column()
  public noun: string;

  @Column()
  public parserId: string;

  @Column()
  public verb: CommandVerb;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

  @Column({
    name: 'labels',
  })
  protected labelStr: string;

  @AfterLoad()
  public syncMap() {
    this.data = new Map(JSON.parse(this.dataStr));
    this.labels = new Map(JSON.parse(this.labelStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    this.dataStr = JSON.stringify(Array.from(this.data));
    this.labelStr = JSON.stringify(Array.from(this.labels));
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

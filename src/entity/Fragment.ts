import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from './BaseEntity';
import { Command, CommandOptions } from './Command';

export interface FragmentOptions {
  command: CommandOptions;

  /**
   * The next key to be filled.
   *
   * For the Lex parser, this is a slot within the intent (noun).
   */
  key: string;
}

export class Fragment extends BaseEntity implements FragmentOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public command: Command;

  @Column()
  public key: string;

  public toJSON() {
    return {
      command: this.command.toJSON(),
      id: this.id,
      key: this.key,
    };
  }
}

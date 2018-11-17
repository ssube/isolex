import { CommandOptions, Command } from './Command';
import { BaseEntity } from './BaseEntity';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

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

  toJSON() {
    return {
      id: this.id,
      command: this.command.toJSON(),
      key: this.key,
    };
  }
}
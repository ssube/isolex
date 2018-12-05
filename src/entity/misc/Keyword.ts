import { Command } from 'src/entity/Command';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

export interface KeywordOptions {
  command: Command;
  controller: string;
  name: string;
}

@Entity()
export class Keyword implements KeywordOptions {
  @OneToOne((type) => Command, (cmd) => cmd.id, {
    cascade: true,
  })
  @JoinColumn()
  public command: Command;

  @Column()
  public controller: string;

  @PrimaryColumn()
  public name: string;

  constructor(options?: KeywordOptions) {
    if (options) {
      this.command = options.command;
      this.controller = options.controller;
      this.name = options.name;
    }
  }
}

import { Command } from 'src/entity/Command';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

export interface KeywordOptions {
  command: Command;
  controller: string;
  name: string;
}

@Entity()
export class Keyword implements KeywordOptions {
  public static create(options: KeywordOptions) {
    const keyword = new Keyword();
    keyword.command = options.command;
    keyword.controller = options.controller;
    keyword.name = options.name;
    return keyword;
  }

  @OneToOne((type) => Command, (cmd) => cmd.id, {
    cascade: true,
  })
  @JoinColumn()
  public command: Command;

  @Column()
  public controller: string;

  @PrimaryColumn()
  public name: string;
}

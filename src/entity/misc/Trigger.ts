import { Command } from 'src/entity/Command';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

export interface TriggerOptions {
  command: Command;
  controller: string;
  name: string;
}

@Entity()
export class Trigger implements TriggerOptions {
  public static create(options: TriggerOptions) {
    const trigger = new Trigger();
    trigger.command = options.command;
    trigger.controller = options.controller;
    trigger.name = options.name;
    return trigger;
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

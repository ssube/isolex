import { Command } from 'src/entity/Command';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

export interface TriggerOptions {
  command: Command;
  handler: string;
  name: string;
}

@Entity()
export class Trigger implements TriggerOptions {
  public static create(options: TriggerOptions) {
    const trigger = new Trigger();
    trigger.command = options.command;
    trigger.handler = options.handler;
    trigger.name = options.name;
    return trigger;
  }

  @OneToOne((type) => Command, (cmd) => cmd.id, {
    cascade: true,
  })
  @JoinColumn()
  public command: Command;

  @Column()
  public handler: string;

  @PrimaryColumn()
  public name: string;
}

import { IntervalData } from '.';
import { Command, CommandOptions } from '../entity/Command';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { BaseInterval, BaseIntervalOptions } from './BaseInterval';

export interface CommandIntervalData extends IntervalData {
  defaultCommand: CommandOptions;
}

export class CommandInterval extends BaseInterval<CommandIntervalData> {
  constructor(options: BaseIntervalOptions<CommandIntervalData>) {
    super(options, 'isolex#/definitions/service-interval-command');
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    const cmd = new Command({
      ...this.data.defaultCommand,
      context,
    });
    await this.bot.executeCommand(cmd);
    return 0;
  }
}

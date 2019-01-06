import { Command, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { IntervalData } from 'src/interval/Interval';

export interface CommandIntervalData extends IntervalData {
  defaultCommand: CommandOptions;
}

export type CommandIntervalOptions = BaseIntervalOptions<CommandIntervalData>;

export class CommandInterval extends BaseInterval<CommandIntervalData> {
  constructor(options: CommandIntervalOptions) {
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

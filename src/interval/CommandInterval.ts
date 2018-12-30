import { Command, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { BaseInterval } from 'src/interval/BaseInterval';
import { IntervalData, IntervalOptions } from 'src/interval/Interval';

export interface CommandIntervalData extends IntervalData {
  defaultCommand: CommandOptions;
}

export type CommandIntervalOptions = IntervalOptions<CommandIntervalData>;

export class CommandInterval extends BaseInterval<CommandIntervalData> {
  constructor(options: CommandIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-command');
  }

  public async tick(context: Context, last: Tick): Promise<number> {
    const cmd = new Command({
      ...this.data.defaultCommand,
      context,
    });
    await this.bot.executeCommand(cmd);
    return 0;
  }
}

import { GeneratorData } from '.';
import { Command, CommandOptions } from '../entity/Command';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { BaseGenerator, BaseIntervalOptions } from './BaseGenerator';

export interface CommandGeneratorData extends GeneratorData {
  defaultCommand: CommandOptions;
}

export class CommandGenerator extends BaseGenerator<CommandGeneratorData> {
  constructor(options: BaseIntervalOptions<CommandGeneratorData>) {
    super(options, 'isolex#/definitions/service-generator-command');
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

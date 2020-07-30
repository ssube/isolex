import { makeDict } from '@apextoaster/js-utils';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { Command, CommandOptions, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { applyTransforms } from '../transform';
import { TYPE_JSON } from '../utils/Mime';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_COMMAND = 'command';

export interface CommandControllerData extends ControllerData {
  defaultCommand: CommandOptions;
}

export class CommandController extends BaseController<CommandControllerData> implements Controller {
  constructor(options: BaseControllerOptions<CommandControllerData>) {
    super(options, 'isolex#/definitions/service-controller-command', [NOUN_COMMAND]);
  }

  @Handler(NOUN_COMMAND, CommandVerb.Create)
  @CheckRBAC()
  public async createCommand(cmd: Command, ctx: Context): Promise<void> {
    const data = await applyTransforms(this.transforms, cmd, TYPE_JSON, makeDict(cmd.data));
    this.logger.debug({ data }, 'creating next command');
    const next = new Command({
      context: ctx,
      data,
      labels: this.labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    });
    this.logger.debug({ next }, 'executing next command');
    await this.bot.executeCommand(next);
  }
}

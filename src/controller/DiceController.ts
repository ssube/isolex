import * as mathjs from 'mathjs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_TEXT } from 'src/utils/Mime';

const DICE_MINIMUM = 1;

export const NOUN_ROLL = 'roll';

export type DiceControllerData = ControllerData;

export type DiceControllerOptions = ControllerOptions<DiceControllerData>;

export class DiceController extends BaseController<DiceControllerData> implements Controller {
  constructor(options: DiceControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-dice', [NOUN_ROLL]);
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get('args');
    if (!args || !args.length) {
      return this.reply(cmd.context, 'no arguments were provided!');
    }

    const results: Array<number> = [];
    for (let i = 0; i < Number(args[1]); i++) {
      const rollResult = mathjs.randomInt(DICE_MINIMUM, Number(args[2]));
      results.push(rollResult);
    }

    this.logger.debug({ args }, 'handling dice results');
    const sum = results.reduce((a, b) => a + b);

    await this.bot.sendMessage(Message.reply(cmd.context, TYPE_TEXT, `The results of your rolls were: ${results}. The sum is ${sum}.`));
  }
}

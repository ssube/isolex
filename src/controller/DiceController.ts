import * as mathjs from 'mathjs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';

const DICE_MINIMUM = 1;

export type DiceControllerConfig = ControllerConfig;

export type DiceControllerOptions = ControllerOptions<DiceControllerConfig>;

export class DiceController extends BaseController<DiceControllerConfig> implements Controller {
  constructor(options: DiceControllerOptions) {
    super(options);
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get('args');
    if (!args || !args.length) {
      throw new Error('no arguments were provided!');
    }

    const results: Array<number> = [];
    for (let i = 0; i < Number(args[1]); i++) {
      const rollResult = mathjs.randomInt(DICE_MINIMUM, Number(args[2]));
      results.push(rollResult);
    }

    this.logger.debug({ args }, 'handling dice results');
    const sum = results.reduce((a, b) => a + b);

    return this.bot.send(Message.reply(`The results of your rolls were: ${results}. The sum is ${sum}.`, cmd.context));
  }
}

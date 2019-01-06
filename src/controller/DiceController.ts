import { MathJsStatic } from 'mathjs';
import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { mustExist } from 'src/utils';

const DICE_MINIMUM = 1;

export const NOUN_ROLL = 'roll';

export type DiceControllerData = ControllerData;

export type DiceControllerOptions = ControllerOptions<DiceControllerData>;

@Inject('math')
export class DiceController extends BaseController<DiceControllerData> implements Controller {
  protected math: MathJsStatic;

  constructor(options: DiceControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-dice', [NOUN_ROLL]);

    this.math = options.math.create({});
  }

  @Handler(NOUN_ROLL, CommandVerb.Create)
  @CheckRBAC()
  public async createRoll(cmd: Command): Promise<void> {
    const count = cmd.getHead('count');
    const sides = cmd.getHead('sides');

    const results: Array<number> = [];
    for (let i = 0; i < Number(count); i += 1) {
      const rollResult = this.math.randomInt(DICE_MINIMUM, Number(sides));
      results.push(rollResult);
    }

    this.logger.debug({ count, sides }, 'handling dice results');
    const sum = results.reduce((a, b) => a + b, 0);

    return this.reply(mustExist(cmd.context), `The results of your rolls were: ${results}. The sum is ${sum}.`);
  }
}

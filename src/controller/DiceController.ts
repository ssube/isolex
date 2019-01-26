import { MathJsStatic } from 'mathjs';
import { Inject } from 'noicejs';

import { INJECT_MATH } from 'src/BaseService';
import { CheckRBAC, Controller, ControllerData, Handler } from 'src/controller';
import { BaseController, BaseControllerOptions } from 'src/controller/BaseController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';

const DICE_MINIMUM = 1;

export const NOUN_ROLL = 'roll';

export type DiceControllerData = ControllerData;

@Inject(INJECT_MATH)
export class DiceController extends BaseController<DiceControllerData> implements Controller {
  protected math: MathJsStatic;

  constructor(options: BaseControllerOptions<DiceControllerData>) {
    super(options, 'isolex#/definitions/service-controller-dice', [NOUN_ROLL]);

    this.math = mustExist(options[INJECT_MATH]).create({});
  }

  @Handler(NOUN_ROLL, CommandVerb.Create)
  @CheckRBAC()
  public async createRoll(cmd: Command, ctx: Context): Promise<void> {
    const count = cmd.getHead('count');
    const sides = cmd.getHead('sides');

    const results: Array<number> = [];
    for (let i = 0; i < Number(count); i += 1) {
      const rollResult = this.math.randomInt(DICE_MINIMUM, Number(sides));
      results.push(rollResult);
    }

    this.logger.debug({ count, sides }, 'handling dice results');
    const sum = results.reduce((a, b) => a + b, 0);

    return this.reply(mustExist(cmd.context), this.translate(ctx, 'create.success', {
      results,
      sum,
    }));
  }

  @Handler(NOUN_ROLL, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}

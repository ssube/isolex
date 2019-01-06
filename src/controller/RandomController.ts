import { isNil, isNumber } from 'lodash';
import { max, min, random, randomInt } from 'mathjs';
import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { countList } from 'src/utils';

export type RandomControllerData = ControllerData;
export type RandomControllerOptions = ControllerOptions<RandomControllerData>;

export const NOUN_RANDOM = 'random';

@Inject()
export class RandomController extends BaseController<RandomControllerData> implements Controller {
  constructor(options: RandomControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-random', [NOUN_RANDOM]);
  }

  @Handler(NOUN_RANDOM, CommandVerb.Get)
  @CheckRBAC()
  public async getRandom(cmd: Command, ctx: Context): Promise<void> {
    const args = cmd.data.get('args');
    if (!Array.isArray(args)) {
      return this.reply(ctx, 'no arguments were provided!');
    }

    const [minVal, maxVal] = args.map(Number);

    this.logger.debug({ max, min }, 'computing random');
    let result = 0 as number | string;
    switch (args.length) {
      case 0: {
        result = this.getRandomDefault();
        break;
      }
      case 1: {
        const precision = this.getPrecision(minVal);
        result = this.getRandomValue(precision, minVal);
        break;
      }
      case 2: {
        const precision = this.getPrecision(minVal, maxVal);
        result = this.getRandomValue(precision, minVal, maxVal);
        break;
      }
    }

    this.logger.debug({ args }, 'Returning random results');

    return this.reply(ctx, `The result of your roll is: ${result}`);
  }

  private getRandomDefault(): number {
    return randomInt(1, 6);
  }

  private getRandomValue(precision: number, minVal: number, maxVal?: number): number | string {
    if (!isNumber(minVal)) {
      return `Provided value: ${minVal} is not a number!`;
    }

    if (!isNumber(maxVal)) {
      return `Provided value: ${maxVal} is not a number!`;
    }

    const minimum = isNil(maxVal) ? min(minVal, 0) : min(minVal, maxVal);
    const maximum = isNil(maxVal) ? max(minVal, 0) : max(minVal, maxVal);

    this.logger.debug({ precision }, 'getting random value');
    if (precision === 0) {
      return randomInt(minimum, maximum);
    }

    // Otherwise we are dealing with at least one float
    return this.round(random(minimum, maximum), precision);
  }

  private getPrecision(...values: Array<number>) {
    return values.map((value) => {
      const parts = value.toString().split('.');
      return countList(parts[1]);
    }).reduce((previous, current) => {
      this.logger.debug({ previous, current }, 'calculating precision');
      return max(current, previous);
    });
  }

  private round(value: number, precision: number): string {
    return value.toString().substr(0, precision + value.toString().split('.')[0].length + 1);
  }
}

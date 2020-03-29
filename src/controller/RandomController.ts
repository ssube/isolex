import { countOf } from '@apextoaster/js-utils';
import { isNil, isNumber } from 'lodash';
import { max, min, random, randomInt } from 'mathjs';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { BaseController, BaseControllerOptions } from './BaseController';

export type RandomControllerData = ControllerData;

export const NOUN_RANDOM = 'random';

@Inject()
export class RandomController extends BaseController<RandomControllerData> implements Controller {
  constructor(options: BaseControllerOptions<RandomControllerData>) {
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
    switch (args.length) {
      case 0: {
        const result = this.getRandomDefault();
        return this.reply(ctx, `The result of your roll is: ${result}`);
      }
      case 1: {
        const precision = this.getPrecision(minVal);
        const result = this.getRandomValue(precision, minVal);
        return this.reply(ctx, `The result of your roll is: ${result}`);
      }
      case 2: {
        const precision = this.getPrecision(minVal, maxVal);
        const result = this.getRandomValue(precision, minVal, maxVal);
        return this.reply(ctx, `The result of your roll is: ${result}`);
      }
      default:
        return this.reply(ctx, 'invalid args');
    }
  }

  private getRandomDefault(): number {
    return randomInt(1, 6);
  }

  private getRandomValue(precision: number, minVal: number, maxVal?: number): string {
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
      return randomInt(minimum, maximum).toFixed(precision);
    }

    // Otherwise we are dealing with at least one float
    return this.round(random(minimum, maximum), precision);
  }

  private getPrecision(...values: Array<number>) {
    return values.map((value) => {
      const parts = value.toString().split('.');
      return countOf(parts[1]);
    }).reduce((previous, current) => {
      this.logger.debug({ previous, current }, 'calculating precision');
      return max(current, previous);
    });
  }

  private round(value: number, precision: number): string {
    return value.toString().substr(0, precision + value.toString().split('.')[0].length + 1);
  }
}

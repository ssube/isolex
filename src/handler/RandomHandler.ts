import * as mathjs from 'mathjs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';

enum NumberSet {
  Natural,
  Integer,
  Real,
}

export interface RandomHandlerConfig {
  field: string;
  name: string;
}

export interface RandomHandlerOptions extends HandlerOptions<RandomHandlerConfig> {
  // snoop
}

export class RandomHandler implements Handler {
  protected bot: Bot;
  protected config: RandomHandlerConfig;
  protected logger: Logger;
  
  constructor(options: RandomHandlerOptions) {
    this.bot = options.bot;
    this.config = options.config;
    this.logger = options.logger.child({
        class: RandomHandler.name
    });
  }

  public async handle(cmd: Command): Promise<boolean> {
    if (cmd.name !== this.config.name) {
        return false;
    }

    const args = cmd.data.get('args');   
    if (!args) {
      throw new Error('no arguments were provided!');
    }

    this.logger.debug({ args }, 'computing random..');
    let result = 0 as number | string;
    switch (args.length) {
      case 0: { 
        result = this.randomDefault();
        break;
      }
      case 1: {
        const set = this.inferNumberSet(Number(args[0]));
        result = this.randomFromNumberSet(set, Number(args[0]));
        break;
      }
      case 2: {
        const set1 = this.inferNumberSet(Number(args[0]));
        const set2 = this.inferNumberSet(Number(args[1]));
        const widestSet = this.getWidestSet(set1, set2);
        result = this.randomFromNumberSet(widestSet, Number(args[0]), Number(args[1]));
        break;
      }
    }

    this.logger.debug({ args }, 'Returning random results');
    const msg = Message.create({
      body: `The result of your roll is: ${result}`,
      context: cmd.context,
      reactions: []
    });

    await this.bot.send(msg);
    return true;
  }

  private randomDefault(): number {
    return mathjs.randomInt(1, 6);
  }

  private randomFromNumberSet(set: NumberSet, val1: number, val2?: number): number | string {
    if (isNaN(val1) || (val2 !== undefined && isNaN(val2))) {
      throw new Error('Given values do not belong to any known number set');
    }

    if (val1 === val2) {
      return val1;
    }

    const minimum = !val2 ? mathjs.min(0, val1) : mathjs.min(val1, val2);
    const maximum = !val2 ? mathjs.max(0, val1) : mathjs.max(val1, val2);

    switch (set) {
      case NumberSet.Natural:
        return mathjs.randomInt(0, maximum);
      case NumberSet.Integer:
        return mathjs.randomInt(minimum, maximum);
      case NumberSet.Real: 
        const precision = this.getPrecision(minimum, maximum);
        return this.round(mathjs.random(minimum, maximum), precision);
    }
  }

  private inferNumberSet(value: number): NumberSet {
    if (isNaN(value)) {
      throw new Error('Given value is not a number');
    }

    if (value >= 0) {
      return value % 1 === 0 ? NumberSet.Natural : NumberSet.Real;
    }
    return value % 1 === 0 ? NumberSet.Integer : NumberSet.Real;
  }

  private getWidestSet(set1: NumberSet, set2: NumberSet) {
    return set1.toString() > set2.toString() ? set1 : set2;
  }

  private getPrecision(...values: number[]) {
    let precision = 0;
    values.forEach(value => {
      const parts = value.toString().split('.');
      if (parts[1] !== undefined) {
        const valuePrecision = parts[1].length;
        if (valuePrecision > precision) {
          precision = valuePrecision;
        }
      }
    });

    return precision;
  }

  private round(value: number, precision: number): string {
    return value.toString().substr(0, precision + value.toString().split('.')[0].length + 1);
  }
}

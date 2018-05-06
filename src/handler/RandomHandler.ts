import { max, min, random, randomInt } from 'mathjs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';

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
        result = this.getRandomDefault();
        break;
      }
      case 1: {
        const precision = this.getPrecision(Number(args[0]));
        result = this.getRandomValue(precision, Number(args[0]));
        break;
      }
      case 2: {
        const precision = this.getPrecision(Number(args[0]), Number([args[1]]));
        result = this.getRandomValue(precision, Number(args[0]), Number(args[1]));
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

  private getRandomDefault(): number {
    return randomInt(1, 6);
  }

  private getRandomValue(precision: number, val1: number, val2?: number): number | string {
    if (isNaN(val1)) {
      throw new Error(`Provided value: ${val1} is not a number!`);
    }
    if (!!val2 && isNaN(val2)) {
      throw new Error(`Provided value: ${val2} is not a number!`);
    }

    const minimum = val2 === undefined ? min(val1, 0) : min(val1, val2);
    const maximum = val2 === undefined ? max(val1, 0) : max(val1, val2);

    if (precision === 0) {
      return randomInt(minimum, maximum);
    }

    // Otherwise we are dealing with at least one float
    return this.round(random(minimum, maximum), precision);
  }

  private getPrecision(...values: number[]) {
    const precision = values.map(value => {
      const parts = value.toString().split('.');
      return parts[1] !== undefined ? parts[1].length : 0;
    })
    .reduce((previous, current) => {
      return current > previous ? current : previous;
    });

    return precision;
  }

  private round(value: number, precision: number): string {
    return value.toString().substr(0, precision + value.toString().split('.')[0].length + 1);
  }
}

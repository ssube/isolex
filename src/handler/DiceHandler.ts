import * as mathjs from 'mathjs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler, HandlerOptions } from 'src/handler/Handler';
import { Message } from 'src/Message';

export interface DiceHandlerConfig {
  field: string;
  name: string;
}

export interface DiceHandlerOptions extends HandlerOptions<DiceHandlerConfig> {
  // snoop
}

export class DiceHandler implements Handler {
  protected bot: Bot;
  protected config: DiceHandlerConfig;
  protected logger: Logger;
  
  constructor(options: DiceHandlerOptions) {
    this.bot = options.bot;
    this.config = options.config;
    this.logger = options.logger.child({
        class: DiceHandler.name
    });
  }

  public async handle(cmd: Command): Promise<boolean> {
    if (cmd.name !== this.config.name) {
      return false;
    }
  
    const args = cmd.data.get('args');
    if (!args || !args.length) {
      throw new Error('no arguments were provided!');
    }

    const dicePattern = /(\d+)(?:d|D)(\d+)/;
    const match = dicePattern.exec(args[0]);
    if (match === null) {
      throw new Error('Incorrect argument pattern');
    }

    this.logger.debug({ match }, 'matched dice pattern')
    let results = [] as number[];
    for (let i = 0; i < Number(match[1]); i++) {
      const rollResult = mathjs.randomInt(1, Number(match[2]));
      results.push(rollResult);
    }

    this.logger.debug({ match }, 'handling dice results')
    const sum = results.reduce((a, b) => { return a + b });
    const msg = Message.create({
      body: `The results of your rolls were: ${results}. The sum is ${sum}.`,
      context: cmd.context,
      reactions: []
    });

    await this.bot.send(msg);
    return true;
  }
}

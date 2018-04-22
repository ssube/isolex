import * as bunyan from 'bunyan';
import { Bot } from 'src/Bot';
import { Command } from 'src/command/Command';
import { Handler } from 'src/handler/Handler';

export interface EchoHandlerOptions {
  bot: Bot;
  logger: bunyan;
}

// @Inject(Bot)
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: bunyan;

  constructor(options: EchoHandlerOptions) {
    this.logger = options.logger.child({
      class: EchoHandler.name
    });
    this.logger.debug('creating echo handler', options);

    this.bot = options.bot;
  }

  public async handle(cmd: Command): Promise<boolean> {
    this.logger.debug({cmd}, 'echoing command');
    await this.bot.send({
      body: JSON.stringify(cmd),
      dest: cmd.from
    });
    return true;
  }
}
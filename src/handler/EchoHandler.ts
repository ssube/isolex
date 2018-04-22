import * as bunyan from 'bunyan';
import * as handlebars from 'handlebars';
import { Bot } from 'src/Bot';
import { Command } from 'src/command/Command';
import { Handler } from 'src/handler/Handler';

export interface EchoHandlerConfig {
  pattern: string;
}

export interface EchoHandlerOptions {
  bot: Bot;
  config: EchoHandlerConfig;
  logger: bunyan;
}

// @Inject(Bot)
export class EchoHandler implements Handler {
  protected bot: Bot;
  protected logger: bunyan;
  protected template: HandlebarsTemplateDelegate;

  constructor(options: EchoHandlerOptions) {
    this.logger = options.logger.child({
      class: EchoHandler.name
    });
    this.logger.debug({options}, 'creating echo handler');

    this.bot = options.bot;
    this.template = handlebars.compile(options.config.pattern);
  }

  public async handle(cmd: Command): Promise<boolean> {
    this.logger.debug({cmd}, 'echoing command');
    await this.bot.send({
      body: this.template({cmd}),
      dest: cmd.from
    });
    return true;
  }
}

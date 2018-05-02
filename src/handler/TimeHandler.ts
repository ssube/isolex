import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';

export interface TimeHandlerConfig {
  locale: string;
  zone: string;
}

export interface TimeHandlerOptions {
  bot: Bot;
  config: TimeHandlerConfig;
  logger: Logger;
}

export class TimeHandler implements Handler {
  protected bot: Bot;
  protected config: TimeHandlerConfig;
  protected logger: Logger;
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TimeHandlerOptions) {
    this.logger = options.logger.child({
      class: TimeHandler.name
    });

    this.bot = options.bot;
    this.config = options.config;
  }

  public async handle(cmd: Command): Promise<boolean> {
    if (cmd.name !== 'test_time') {
      return false;
    }

    let timeZone = this.config.zone;
    if (cmd.has('zone')) {
      timeZone = cmd.get('zone');
    }

    const date = new Date();
    this.logger.debug({date, timeZone, locale: this.config.locale}, 'handling time');
    const msg = new Message({
      body: date.toLocaleString(this.config.locale, {timeZone}),
      context: cmd.context,
      reactions: []
    });
    await this.bot.send(msg);
    return true;
  }
}

import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';
import { ServiceOptions } from 'src/Service';

export interface TimeHandlerConfig extends HandlerConfig {
  locale: string;
  zone: string;
}

export type TimeHandlerOptions = HandlerOptions<TimeHandlerConfig>;

export class TimeHandler extends BaseHandler<TimeHandlerConfig> implements Handler {
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TimeHandlerOptions) {
    super(options);
  }

  public async handle(cmd: Command): Promise<void> {
    let timeZone = this.config.zone;
    if (cmd.has('zone')) {
      timeZone = cmd.get('zone');
    }

    const date = new Date();
    this.logger.debug({date, timeZone, locale: this.config.locale}, 'handling time');
    const msg = Message.create({
      body: date.toLocaleString(this.config.locale, {timeZone}),
      context: cmd.context,
      reactions: []
    });
    await this.bot.send(msg);
  }
}

import { defaultTo } from 'lodash';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';

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
    const date = new Date();
    const locale = cmd.getHeadOrDefault('locale', this.config.locale);
    const zone = cmd.getHeadOrDefault('zone', this.config.zone);

    this.logger.debug({ date, locale, zone }, 'handling time');
    return this.bot.send(Message.reply(date.toLocaleString(locale, { timeZone: zone }), cmd.context));
  }
}

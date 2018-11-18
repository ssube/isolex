import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerConfig, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';

export interface TimeControllerConfig extends ControllerConfig {
  locale: string;
  zone: string;
}

export type TimeControllerOptions = ControllerOptions<TimeControllerConfig>;

export class TimeController extends BaseController<TimeControllerConfig> implements Controller {
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TimeControllerOptions) {
    super(options);
  }

  public async handle(cmd: Command): Promise<void> {
    const date = new Date();
    const locale = cmd.getHeadOrDefault('locale', this.data.locale);
    const zone = cmd.getHeadOrDefault('zone', this.data.zone);

    this.logger.debug({ date, locale, zone }, 'handling time');
    return this.bot.send(Message.reply(date.toLocaleString(locale, { timeZone: zone }), cmd.context));
  }
}

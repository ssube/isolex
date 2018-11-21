import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface TimeControllerData extends ControllerData {
  locale: string;
  zone: string;
}

export type TimeControllerOptions = ControllerOptions<TimeControllerData>;

export class TimeController extends BaseController<TimeControllerData> implements Controller {
  protected template: HandlebarsTemplateDelegate;

  constructor(options: TimeControllerOptions) {
    super(options);
  }

  public async handle(cmd: Command): Promise<void> {
    const date = new Date();
    const locale = cmd.getHeadOrDefault('locale', this.data.locale);
    const zone = cmd.getHeadOrDefault('zone', this.data.zone);

    this.logger.debug({ date, locale, zone }, 'handling time');
    return this.bot.send(Message.reply(cmd.context, TYPE_TEXT, date.toLocaleString(locale, { timeZone: zone })));
  }
}

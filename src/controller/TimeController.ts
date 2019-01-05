import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Clock } from 'src/utils/Clock';

export const NOUN_TIME = 'time';

export interface TimeControllerData extends ControllerData {
  locale: string;
  zone: string;
}

export type TimeControllerOptions = ControllerOptions<TimeControllerData>;

@Inject('clock')
export class TimeController extends BaseController<TimeControllerData> implements Controller {
  protected readonly clock: Clock;

  constructor(options: TimeControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-time', [NOUN_TIME]);

    this.clock = options.clock;
  }

  @Handler(NOUN_TIME, CommandVerb.Get)
  @CheckRBAC()
  public async getTime(cmd: Command, ctx: Context): Promise<void> {
    const date = this.clock.getDate();
    const locale = cmd.getHeadOrDefault('locale', this.data.locale);
    const zone = cmd.getHeadOrDefault('zone', this.data.zone);

    this.logger.debug({ date, locale, zone }, 'handling time');

    try {
      const localDate = date.toLocaleString(locale, { timeZone: zone });
      return this.reply(ctx, localDate);
    } catch (err) {
      return this.reply(ctx, `error formatting date: ${err.message}`);
    }
  }
}

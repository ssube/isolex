import { mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { Command, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { Clock } from '../utils/Clock';
import { BaseController, BaseControllerOptions } from './BaseController';

export const NOUN_TIME = 'time';

export interface TimeControllerData extends ControllerData {
  locale: string;
  zone: string;
}

@Inject(INJECT_CLOCK)
export class TimeController extends BaseController<TimeControllerData> implements Controller {
  protected readonly clock: Clock;

  constructor(options: BaseControllerOptions<TimeControllerData>) {
    super(options, 'isolex#/definitions/service-controller-time', [NOUN_TIME]);

    this.clock = mustExist(options[INJECT_CLOCK]);
  }

  @Handler(NOUN_TIME, CommandVerb.Get)
  @CheckRBAC()
  public async getTime(cmd: Command, ctx: Context): Promise<void> {
    const time = this.clock.getDate();
    const locale = cmd.getHeadOrDefault('locale', this.data.locale);
    const zone = cmd.getHeadOrDefault('zone', this.data.zone);

    this.logger.debug({ locale, time, zone }, 'handling time');
    return this.reply(ctx, this.translate(ctx, 'get.success', {
      time,
    }));
  }

  @Handler(NOUN_TIME, CommandVerb.Help)
  public async getHelp(cmd: Command, ctx: Context): Promise<void> {
    return this.reply(ctx, this.defaultHelp(cmd));
  }
}

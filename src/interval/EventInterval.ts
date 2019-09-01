import { IntervalData } from '.';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { ServiceEvent, ServiceMetadata } from '../Service';
import { BaseInterval, BaseIntervalOptions } from './BaseInterval';

export interface EventIntervalData extends IntervalData {
  services: Array<ServiceMetadata>;
}

export class EventInterval extends BaseInterval<EventIntervalData> {
  constructor(options: BaseIntervalOptions<EventIntervalData>) {
    super(options, 'isolex#/definitions/service-interval-event');
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    for (const def of this.data.services) {
      this.logger.debug({ def }, 'notifying service');
      const svc = this.services.getService(def);
      await svc.notify(ServiceEvent.Tick);
    }
    return 0;
  }
}

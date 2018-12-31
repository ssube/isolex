import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { IntervalData } from 'src/interval/Interval';
import { ServiceEvent, ServiceMetadata } from 'src/Service';

export interface EventIntervalData extends IntervalData {
  services: Array<ServiceMetadata>;
}

export type EventIntervalOptions = BaseIntervalOptions<EventIntervalData>;

export class EventInterval extends BaseInterval<EventIntervalData> {
  constructor(options: EventIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-event');
  }

  public async tick(context: Context, last: Tick): Promise<number> {
    for (const def of this.data.services) {
      this.logger.debug({ def }, 'notifying service');
      const svc = this.services.getService(def);
      await svc.notify(ServiceEvent.Tick);
    }
    return 0;
  }
}

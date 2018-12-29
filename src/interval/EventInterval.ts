import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { BaseInterval } from 'src/interval/BaseInterval';
import { IntervalData, IntervalOptions } from 'src/interval/Interval';
import { ServiceLifecycle, ServiceMetadata } from 'src/Service';

export interface EventIntervalData extends IntervalData {
  event: ServiceLifecycle;
  services: Array<ServiceMetadata>;
}

export type EventIntervalOptions = IntervalOptions<EventIntervalData>;

export class EventInterval extends BaseInterval<EventIntervalData> {
  constructor(options: EventIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-event');
  }

  public async tick(context: Context, last: Tick): Promise<number> {
    for (const def of this.data.services) {
      const svc = this.services.getService(def);
      await svc.notify(this.data.event);
    }
    return 0;
  }
}

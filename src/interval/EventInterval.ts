import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { IntervalData } from 'src/interval';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { ServiceEvent, ServiceMetadata } from 'src/Service';

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

import { GeneratorData } from '.';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { ServiceEvent, ServiceMetadata } from '../Service';
import { BaseGenerator, BaseIntervalOptions } from './BaseGenerator';

export interface EventGeneratorData extends GeneratorData {
  services: Array<ServiceMetadata>;
}

export class EventGenerator extends BaseGenerator<EventGeneratorData> {
  constructor(options: BaseIntervalOptions<EventGeneratorData>) {
    super(options, 'isolex#/definitions/service-generator-event');
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

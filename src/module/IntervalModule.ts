import { ModuleOptions } from 'noicejs';

import { CommandInterval } from '../interval/CommandInterval';
import { EventInterval } from '../interval/EventInterval';
import { MessageInterval } from '../interval/MessageInterval';
import { MetricsInterval } from '../interval/MetricsInterval';
import { BaseModule } from './BaseModule';

export class IntervalModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // intervals
    this.bindService(CommandInterval);
    this.bindService(EventInterval);
    this.bindService(MessageInterval);
    this.bindService(MetricsInterval);
  }
}

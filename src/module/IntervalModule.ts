import { ModuleOptions } from 'noicejs/Module';

import { CommandInterval } from 'src/interval/CommandInterval';
import { EventInterval } from 'src/interval/EventInterval';
import { MessageInterval } from 'src/interval/MessageInterval';
import { MetricsInterval } from 'src/interval/MetricsInterval';
import { BaseModule } from 'src/module/BaseModule';

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

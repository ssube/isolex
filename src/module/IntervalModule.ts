import { ModuleOptions } from 'noicejs';

import { CommandGenerator } from '../generator/CommandGenerator';
import { EventGenerator } from '../generator/EventGenerator';
import { MessageGenerator } from '../generator/MessageGenerator';
import { MetricsGenerator } from '../generator/MetricsGenerator';
import { BaseModule } from './BaseModule';

export class IntervalModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // intervals
    this.bindService(CommandGenerator);
    this.bindService(EventGenerator);
    this.bindService(MessageGenerator);
    this.bindService(MetricsGenerator);
  }
}

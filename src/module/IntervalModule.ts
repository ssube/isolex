import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { CommandInterval } from 'src/interval/CommandInterval';
import { EventInterval } from 'src/interval/EventInterval';
import { MessageInterval } from 'src/interval/MessageInterval';

export class IntervalModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // intervals
    this.bind(kebabCase(CommandInterval.name)).toConstructor(CommandInterval);
    this.bind(kebabCase(EventInterval.name)).toConstructor(EventInterval);
    this.bind(kebabCase(MessageInterval.name)).toConstructor(MessageInterval);
  }
}

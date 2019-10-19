import { Inject } from 'noicejs';
import { Registry } from 'prom-client';

import { Interval, IntervalOptions } from '.';
import { mustExist } from '..';
import { INJECT_CLOCK } from '../../BaseService';
import { Clock } from '../Clock';
import { Collector } from '../Metrics';

export interface MetricsOptions extends IntervalOptions {
  [INJECT_CLOCK]: Clock;
  collector: Collector;
  registry: Registry;
}

@Inject(INJECT_CLOCK)
export class MetricsInterval extends Interval {
  protected readonly clock: Clock;
  protected readonly interval: NodeJS.Timeout;

  constructor(options: MetricsOptions) {
    super(options);
    this.clock = mustExist(options[INJECT_CLOCK]);
    this.interval = options.collector({
      register: options.registry,
      timeout: parseInt(mustExist(options.freq.time), 10),
    });
  }

  public async stop() {
    this.clock.clearInterval(this.interval);
  }
}

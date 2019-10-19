import { Inject } from 'noicejs';

import { Interval, IntervalOptions } from '.';
import { mustExist } from '..';
import { INJECT_CLOCK } from '../../BaseService';
import { Clock } from '../Clock';

export interface TimeOptions extends IntervalOptions {
  [INJECT_CLOCK]: Clock;
}

@Inject(INJECT_CLOCK)
export class TimeInterval extends Interval {
  protected readonly clock: Clock;
  protected readonly interval: NodeJS.Timeout;

  constructor(options: TimeOptions) {
    super(options);
    this.clock = mustExist(options[INJECT_CLOCK]);
    this.interval = this.clock.setInterval(() => {
      this.tick();
    }, parseInt(mustExist(options.freq.time), 10));
  }

  public async stop() {
    this.clock.clearInterval(this.interval);
  }
}

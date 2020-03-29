import { mustExist } from '@apextoaster/js-utils';
import { CronJob } from 'cron';

import { Interval, IntervalOptions } from '.';

export class CronInterval extends Interval {
  protected readonly job: CronJob;

  constructor(options: IntervalOptions) {
    super(options);
    this.job = new CronJob(mustExist(options.freq.cron), () => {
      this.tick();
    }, () => {
      /* complete */
    }, true);
  }

  public async stop() {
    this.job.stop();
  }
}

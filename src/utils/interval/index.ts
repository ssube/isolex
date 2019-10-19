import { BaseOptions, Inject, Logger } from 'noicejs';

import { mustExist } from '..';
import { INJECT_LOGGER } from '../../BaseService';

export type IntervalFn = () => Promise<void>;

export interface IntervalFrequency {
  cron?: string;
  time?: string;
}

export interface IntervalOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
  fn: IntervalFn;
  freq: IntervalFrequency;
}

@Inject(INJECT_LOGGER)
export abstract class Interval {
  protected readonly fn: IntervalFn;
  protected readonly logger: Logger;

  constructor(options: IntervalOptions) {
    this.fn = options.fn;
    this.logger = mustExist(options[INJECT_LOGGER]);
  }

  public tick(): void {
    this.fn().catch((err) => {
      this.logger.error(err, 'interval tick error');
    });
  }

  public abstract stop(): Promise<void>;
}

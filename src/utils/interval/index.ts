import { BaseOptions } from 'noicejs';

export type IntervalFn = () => Promise<void>;

export interface IntervalFrequency {
  cron?: string;
  time?: string;
}

export interface IntervalOptions extends BaseOptions {
  fn: IntervalFn;
  freq: IntervalFrequency;
}

export abstract class Interval {
  protected readonly fn: IntervalFn;

  constructor(options: IntervalOptions) {
    this.fn = options.fn;
  }

  public tick(): void {
    this.fn().catch((err) => {
      // tslint:disable-next-line:no-console
      console.error(err, 'interval error, needs a logger');
    });
  }

  public abstract stop(): Promise<void>;
}

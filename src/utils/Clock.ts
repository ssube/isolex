import { BaseOptions } from 'noicejs/Container';

const NOW_TO_SECONDS = 1000;

export interface ClockOptions extends BaseOptions {
  date?: DateConstructor;
}

export class Clock {
  public readonly date: DateConstructor;

  constructor(options: ClockOptions) {
    const { date = Date } = options;
    this.date = date;
  }

  public getDate(): Date {
    return new Date();
  }

  public getSeconds(): number {
    return Math.floor(this.date.now() / NOW_TO_SECONDS);
  }
}

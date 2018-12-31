import { isNil } from 'lodash';
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

  public clearInterval(id: number) {
    clearInterval(id);
  }

  public getDate(seconds?: number): Date {
    if (isNil(seconds)) {
      return new Date();
    } else {
      return new Date(seconds);
    }
  }

  public getSeconds(): number {
    return Math.floor(this.date.now() / NOW_TO_SECONDS);
  }

  public setInterval(cb: Function, delay: number): number {
    return setInterval(cb, delay);
  }
}

export function dateToSeconds(date: Date): number {
  return Math.floor(date.valueOf() / NOW_TO_SECONDS);
}

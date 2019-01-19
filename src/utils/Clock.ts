import { isNil } from 'lodash';
import { BaseOptions } from 'noicejs';

const NOW_TO_SECONDS = 1000;

export type ClockHandler = () => void;

export interface ClockOptions extends BaseOptions {
  date?: DateConstructor;
}

export class Clock {
  public readonly date: DateConstructor;

  constructor(options: ClockOptions) {
    const { date = Date } = options;
    this.date = date;
  }

  public clearInterval(id: NodeJS.Timeout) {
    clearInterval(id);
  }

  public clearTimeout(id: NodeJS.Timeout) {
    clearTimeout(id);
  }

  public getDate(seconds?: number): Date {
    if (isNil(seconds)) {
      return new Date();
    } else {
      return new Date(seconds * NOW_TO_SECONDS);
    }
  }

  public getSeconds(): number {
    return Math.floor(this.date.now() / NOW_TO_SECONDS);
  }

  public setInterval(cb: ClockHandler, delay: number): NodeJS.Timeout {
    return setInterval(cb, delay);
  }

  public setTimeout(cb: ClockHandler, delay: number): NodeJS.Timeout {
    return setTimeout(cb, delay);
  }
}

export function dateToSeconds(date: Date): number {
  return Math.floor(date.valueOf() / NOW_TO_SECONDS);
}

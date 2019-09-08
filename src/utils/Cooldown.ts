import { BaseOptions, Inject } from 'noicejs';
import { Observable, Subject } from 'rxjs';

import { doesExist } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { ServiceLifecycle } from '../Service';
import { Clock, ClockHandler } from './Clock';

export const GROWTH_FACTOR = 2;
export interface CooldownOptions extends BaseOptions {
  [INJECT_CLOCK]: Clock;
  base: number;
  grow: number;
}

/**
 * Cooldown is a specialized counter for rate limiting, bans, and the like.
 *
 * Every time it is increased, the rate of growth for next time increases by the same amount. This is, essentially,
 * an exponential interval with an observable.
 */
@Inject(INJECT_CLOCK)
export class Cooldown implements ServiceLifecycle {
  protected readonly boundNext: ClockHandler;
  protected readonly clock: Clock;
  protected readonly data: CooldownOptions;
  protected readonly stream: Subject<number>;

  protected active: boolean;
  protected grow: number;
  protected rate: number;
  protected ticks: number;
  protected timer?: NodeJS.Timeout;

  constructor(options: CooldownOptions) {
    this.active = false;
    this.boundNext = this.next.bind(this);
    this.clock = options[INJECT_CLOCK];
    this.data = options;
    this.grow = options.grow;
    this.rate = options.base;
    this.stream = new Subject();
    this.ticks = 0;
  }

  public async start() {
    this.active = true;
    this.boundNext();
  }

  public async stop() {
    this.stream.complete();
    if (doesExist(this.timer)) {
      this.clock.clearTimeout(this.timer);
    }
  }

  /**
   * Decrease the rate and the growth rate by the current growth rate.
   *
   * @returns the new rate
   */
  public dec(): number {
    this.grow = Math.max(this.grow / GROWTH_FACTOR, this.data.grow);
    this.rate = Math.max(this.rate - this.grow, this.data.base);
    return this.rate;
  }

  /**
   * Increase the rate and the growth rate by the current growth rate.
   *
   * @returns the new rate
   */
  public inc(): number {
    this.rate += this.grow;
    this.grow += this.grow;
    return this.rate;
  }

  public next() {
    this.stream.next(this.ticks);
    this.ticks += 1;

    if (this.active) {
      this.timer = this.clock.setTimeout(this.boundNext, this.rate);
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public getStream(): Observable<number> {
    return this.stream;
  }

  public getTicks(): number {
    return this.ticks;
  }
}

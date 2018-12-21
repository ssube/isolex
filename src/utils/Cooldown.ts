import { Observable, Subject } from 'rxjs';

import { BaseService, BaseServiceOptions } from 'src/BaseService';

export const GROWTH_FACTOR = 2;
export interface CooldownData {
  base: number;
  grow: number;
}

export type CooldownOptions = BaseServiceOptions<CooldownData>;

/**
 * Cooldown is a specialized counter for rate limiting, bans, and the like.
 *
 * Every time it is increased, the rate of growth for next time increases by the same amount. This is, essentially,
 * an exponential interval with an observable.
 */
export class Cooldown extends BaseService<CooldownData> {
  public readonly id: string;
  public readonly name: string;

  protected active: boolean;
  protected boundNext: Function;
  protected grow: number;
  protected rate: number;
  protected stream: Subject<number>;
  protected ticks: number;
  protected timer: number;

  constructor(options: CooldownOptions) {
    super(options, 'isolex#/definitions/utils-cooldown');

    this.active = false;
    this.boundNext = this.next.bind(this);
    this.grow = options.data.grow;
    this.rate = options.data.base;
    this.stream = new Subject();
    this.ticks = 0;
    this.timer = 0;
  }

  public async start() {
    this.active = true;
    this.boundNext();
  }

  public async stop() {
    this.stream.complete();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
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
    const ticks = this.ticks++;

    this.stream.next(ticks);

    if (this.active) {
      this.timer = setTimeout(this.boundNext, this.rate);
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

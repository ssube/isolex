import { Observable, Subject } from 'rxjs';
import { BaseService } from 'src/BaseService';
import { ServiceOptions } from 'src/Service';

export const GROWTH_FACTOR = 2;
export interface CooldownConfig {
  base: number;
  grow: number;
}

export type CooldownOptions = ServiceOptions<CooldownConfig>;

/**
 * Cooldown is a specialized counter for rate limiting, bans, and the like.
 *
 * Every time it is increased, the rate of growth for next time increases by the same amount. This is, essentially,
 * an exponential interval with an observable.
 */
export class Cooldown extends BaseService<CooldownConfig> {
  public readonly id: string;
  public readonly name: string;

  protected active: boolean;
  protected boundNext: Function;
  protected config: CooldownConfig;
  protected grow: number;
  protected rate: number;
  protected stream: Subject<number>;
  protected ticks: number;
  protected timer: number;

  constructor(options: CooldownOptions) {
    super(options);

    this.active = false;
    this.boundNext = this.next.bind(this);
    this.config = options.data;
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
    this.grow = Math.max(this.grow / GROWTH_FACTOR, this.config.grow);
    this.rate = Math.max(this.rate - this.grow, this.config.base);
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

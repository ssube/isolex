import { Observable, Subject } from 'rxjs';
import { Runnable } from 'src/Runnable';

export interface CooldownOptions {
  base: number;
  grow: number;
}

/**
 * Cooldown is a specialized counter for rate limiting, bans, and the like.
 *
 * Every time it is increased, the rate of growth for next time increases by the same amount. This is, essentially,
 * an exponential interval with an observable.
 */
export class Cooldown implements Runnable {
  protected active: boolean;
  protected boundNext: Function;
  protected config: CooldownOptions;
  protected grow: number;
  protected rate: number;
  protected stream: Subject<number>;
  protected ticks: number;
  protected timer: number;

  constructor(options: CooldownOptions) {
    this.active = false;
    this.boundNext = this.next.bind(this);
    this.config = options;
    this.grow = options.grow;
    this.rate = options.base;
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
    }
  }

  /**
   * Decrease the rate and the growth rate by the current growth rate.
   *
   * @returns the new rate
   */
  public dec(): number {
    console.info('===marker dec in', this.grow, this.rate, this.config);
    this.grow = Math.max(this.grow / 2, this.config.grow);
    this.rate = Math.max(this.rate - this.grow, this.config.base);
    console.info('===marker dec out', this.grow, this.rate);
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
    console.info('===marker ticks', ticks, this.ticks);

    this.stream.next(ticks);

    if (this.active) {
      console.info('===marker set timeout', this.rate, this.grow);
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

import { Observable, Subject } from 'rxjs';
import { Runnable } from 'src/Runnable';

export interface CooldownOptions {
  base: number;
  grow: number;
}

/**
 * Cooldown is a specialized counter for rate limiting, bans, and the like.
 */
export class Cooldown implements Runnable {
  protected active: boolean;
  protected base: number;
  protected call: Function;
  protected grow: number;
  protected rate: number;
  protected stream: Subject<number>;
  protected ticks: number;
  protected timer: number;

  constructor(options: CooldownOptions) {
    this.active = false;
    this.base = options.base;
    this.call = this.next.bind(this);
    this.grow = options.grow;
    this.rate = options.base;
    this.stream = new Subject();
    this.ticks = 0;
    this.timer = 0;
  }

  public async start() {
    this.active = true;
    this.next();
  }

  public async stop() {
    this.stream.complete();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  public dec(): number {
    return this.rate -= this.grow;
  }

  public inc(): number {
    return this.rate += this.grow;
  }

  public next() {
    this.stream.next(this.ticks++);

    if (this.active) {
      this.timer = setTimeout(this.call, this.rate);
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

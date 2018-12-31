import { MathJsStatic } from 'mathjs';
import { Inject } from 'noicejs';
import { Equal, FindManyOptions, Repository } from 'typeorm';

import { BotService, BotServiceOptions } from 'src/BotService';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { Interval, IntervalData } from 'src/interval/Interval';
import { Listener } from 'src/listener/Listener';
import { Clock } from 'src/utils/Clock';

export type BaseIntervalOptions<TData extends IntervalData> = BotServiceOptions<TData>;

@Inject('clock', 'math', 'storage')
export abstract class BaseInterval<TData extends IntervalData> extends BotService<TData> implements Interval {
  protected readonly clock: Clock;
  protected readonly math: MathJsStatic;
  protected readonly tickRepository: Repository<Tick>;

  protected interval: number;
  protected target: Listener;

  constructor(options: BaseIntervalOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = options.clock;
    this.math = options.math.create({});
    this.tickRepository = options.storage.getRepository(Tick);
  }

  public async start() {
    await super.start();

    this.logger.debug({ def: this.data.defaultTarget }, 'getting default target listener');
    this.target = this.services.getService(this.data.defaultTarget);
    return this.startInterval();
  }

  public async stop() {
    await super.stop();
    return this.stopInterval();
  }

  public abstract tick(context: Context, last: Tick): Promise<number>;

  protected async startInterval() {
    if (this.data.frequency.cron) {
      this.logger.debug({ cron: this.data.frequency.cron }, 'starting a cron interval');
      throw new NotImplementedError('cron frequency is not implemented');
    }

    if (this.data.frequency.zeit) {
      const ms = this.math.unit(this.data.frequency.zeit).toNumber('millisecond');
      this.logger.debug({ ms }, 'starting a clock interval');
      this.interval = this.clock.setInterval(() => this.nextTick().catch((err) => {
        this.logger.error(err, 'error firing next tick');
      }), ms);
    }
  }

  protected async stopInterval() {
    if (this.data.frequency.zeit) {
      this.clock.clearInterval(this.interval);
    }
  }

  protected async nextTick() {
    const options: FindManyOptions<Tick> = {
      // typeorm requires an order for toString, which is not a column
      order: {
        updatedAt: 'DESC',
      } as any,
      take: 1,
      where: {
        intervalId: Equal(this.id),
      },
    };

    const last = await this.tickRepository.find(options);
    const context = await this.createContext();
    const status = await this.tick(context, last[0]);
    const next = this.tickRepository.create({
      createdAt: this.clock.getSeconds(),
      intervalId: this.id,
      status,
      updatedAt: this.clock.getSeconds(),
    });
    await this.tickRepository.save(next);
  }

  /**
   * Create a context for the interval's next tick.
   *
   * This context entity will be persisted with the command, message, or event for which it has been created.
   */
  protected async createContext(): Promise<Context> {
    return new Context({
      ...this.data.defaultContext,
      target: this.target,
    });
  }
}

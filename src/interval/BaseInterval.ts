import { MathJsStatic } from 'mathjs';
import { Inject } from 'noicejs';
import { Equal, FindManyOptions, Repository } from 'typeorm';

import { BotService, BotServiceOptions } from 'src/BotService';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { Interval, IntervalData } from 'src/interval/Interval';
import { Listener } from 'src/listener/Listener';
import { doesExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';

export type BaseIntervalOptions<TData extends IntervalData> = BotServiceOptions<TData>;

@Inject('clock', 'math', 'storage')
export abstract class BaseInterval<TData extends IntervalData> extends BotService<TData> implements Interval {
  protected readonly clock: Clock;
  protected readonly math: MathJsStatic;

  protected readonly contextRepository: Repository<Context>;
  protected readonly tickRepository: Repository<Tick>;

  protected interval?: NodeJS.Timeout;
  protected target?: Listener;

  constructor(options: BaseIntervalOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = options.clock;
    this.math = options.math.create({});
    this.contextRepository = options.storage.getRepository(Context);
    this.tickRepository = options.storage.getRepository(Tick);
  }

  public async start() {
    await super.start();

    this.logger.debug({ def: this.data.defaultTarget }, 'getting default target listener');
    this.target = this.services.getService<Listener>(this.data.defaultTarget);
    return this.startInterval();
  }

  public async stop() {
    await super.stop();
    return this.stopInterval();
  }

  public abstract tick(context: Context, last: Tick): Promise<number>;

  protected async startInterval() {
    if (doesExist(this.data.frequency.cron)) {
      this.logger.debug({ cron: this.data.frequency.cron }, 'starting a cron interval');
      throw new NotImplementedError('cron frequency is not implemented');
    }

    if (doesExist(this.data.frequency.time)) {
      const ms = this.math.unit(this.data.frequency.time).toNumber('millisecond');
      this.logger.debug({ ms }, 'starting a clock interval');
      this.interval = this.clock.setInterval(() => this.nextTick().catch((err) => {
        this.logger.error(err, 'error firing next tick');
      }), ms);
    }
  }

  protected async stopInterval() {
    if (doesExist(this.data.frequency.time) && doesExist(this.interval)) {
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
    return this.contextRepository.create({
      ...this.data.defaultContext,
      target: this.target,
    });
  }
}

import { doesExist, mustExist } from '@apextoaster/js-utils';
import { MathJsStatic } from 'mathjs';
import { Container, Inject } from 'noicejs';
import { Equal, FindManyOptions, Repository } from 'typeorm';

import { Generator, GeneratorData } from '.';
import { INJECT_CLOCK, INJECT_MATH } from '../BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Context, redirectContext } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { Clock } from '../utils/Clock';
import { Interval } from '../utils/interval';
import { CronInterval } from '../utils/interval/CronInterval';
import { TimeInterval } from '../utils/interval/TimeInterval';

export type BaseGeneratorOptions<TData extends GeneratorData> = BotServiceOptions<TData>;

@Inject(INJECT_CLOCK, INJECT_MATH, INJECT_STORAGE)
export abstract class BaseGenerator<TData extends GeneratorData> extends BotService<TData> implements Generator {
  protected readonly container: Container;
  protected readonly clock: Clock;
  protected readonly math: MathJsStatic;

  protected readonly contextRepository: Repository<Context>;
  protected readonly tickRepository: Repository<Tick>;

  protected interval?: Interval;

  constructor(options: BaseGeneratorOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.container = mustExist(options.container);
    this.clock = mustExist(options[INJECT_CLOCK]);
    this.math = mustExist(options[INJECT_MATH]).create({});

    const storage = mustExist(options[INJECT_STORAGE]);
    this.contextRepository = storage.getRepository(Context);
    this.tickRepository = storage.getRepository(Tick);
  }

  public async start() {
    await super.start();
    await this.startInterval();
  }

  public async startInterval() {
    const fn = async () => {
      this.nextTick().catch((err) => {
        this.logger.error(err, 'error firing next tick');
      });
    };

    if (doesExist(this.data.frequency.cron)) {
      this.logger.debug({ cron: this.data.frequency.cron }, 'starting a cron interval');
      this.interval = await this.container.create(CronInterval, {
        fn,
        freq: {
          cron: this.data.frequency.cron,
        },
      });
    }

    if (doesExist(this.data.frequency.time)) {
      const time = this.math.unit(this.data.frequency.time).toNumber('millisecond').toString();
      this.logger.debug({ time }, 'starting a clock interval');
      this.interval = await this.container.create(TimeInterval, {
        fn,
        freq: {
          time,
        },
      });
    }
  }

  public async stop() {
    await super.stop();

    if (doesExist(this.interval)) {
      await this.interval.stop();
    }
  }

  public abstract tick(context: Context, next: Tick, last?: Tick): Promise<number>;

  protected async nextTick() {
    const options: FindManyOptions<Tick> = {
      // typeorm requires an order for toString, which is not a column
      order: {
        updatedAt: 'DESC',
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      } as any,
      take: 1,
      where: {
        intervalId: Equal(this.id),
      },
    };

    const last = await this.tickRepository.find(options);
    const context = await this.createContext();
    const next = this.tickRepository.create({
      createdAt: this.clock.getSeconds(),
      intervalId: this.id,
      status: 0,
      updatedAt: this.clock.getSeconds(),
    });

    this.logger.debug({ last, next }, 'executing tick');
    next.status = await this.tick(context, next, last[0]);
    await this.tickRepository.save(next);
  }

  /**
   * Create a context for the interval's next tick.
   *
   * This context entity will be persisted with the command, message, or event for which it has been created.
   */
  protected async createContext(): Promise<Context> {
    const base = new Context(this.data.context);
    const ctx = redirectContext(base, this.data.redirect, this.services);
    return this.contextRepository.save(ctx);
  }
}

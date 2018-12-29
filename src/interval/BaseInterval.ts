import { Inject } from 'noicejs';
import { Equal, Repository } from 'typeorm';

import { BotService } from 'src/BotService';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { Interval, IntervalData, IntervalOptions } from 'src/interval/Interval';
import { Clock } from 'src/utils/Clock';

@Inject('clock', 'storage')
export abstract class BaseInterval<TData extends IntervalData> extends BotService<TData> implements Interval {
  protected readonly clock: Clock;
  protected readonly tickRepository: Repository<Tick>;

  protected interval: number;

  constructor(options: IntervalOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = options.clock;
    this.tickRepository = options.storage.getRepository(Tick);
  }

  public async start() {
    await super.start();

    // set up the interval
    this.interval = this.clock.setInterval(() => this.nextTick, 1000); // TODO: frequency from config
  }

  public async stop() {
    await super.stop();

    this.clock.clearInterval(this.interval);
  }

  public abstract tick(context: Context, last: Tick): Promise<number>;

  protected async nextTick() {
    const last = await this.tickRepository.find({
      order: {
        toString: undefined, // needs to be included, otherwise object's toString conflicts with typeorm interface
        updatedAt: 'DESC',
      },
      take: 1,
      where: {
        intervalId: Equal(this.id),
      },
    });
    const context = await this.createTickContext();
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
  protected async createTickContext(): Promise<Context> {
    return new Context();
  }
}

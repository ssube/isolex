import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { BotService } from 'src/BotService';
import { Context } from 'src/entity/Context';
import { Interval, IntervalData, IntervalJob, IntervalOptions } from 'src/interval/Interval';
import { Clock } from 'src/utils/Clock';

@Inject('clock', 'storage')
export abstract class BaseInterval<TData extends IntervalData> extends BotService<TData> implements Interval {
  protected readonly clock: Clock;
  protected readonly tickRepository: Repository<IntervalJob>;

  constructor(options: IntervalOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = options.clock;
    this.tickRepository = options.storage.getRepository(''); // @TODO interval tick/job entity
  }

  public abstract tick(context: Context, last: IntervalJob): Promise<number>;

  protected async nextTick() {
    const last = await this.tickRepository.findOneOrFail({
      // TODO: most recent
      intervalId: this.id,
    });
    const context = await this.createTickContext();
    const status = await this.tick(context, last);
    const next: IntervalJob = {
      createdAt: this.clock.getSeconds(),
      intervalId: this.id,
      status,
      updatedAt: this.clock.getSeconds(),
    };
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

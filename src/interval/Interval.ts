import { BotServiceData, BotServiceOptions } from 'src/BotService';
import { Context, ContextOptions } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { Service, ServiceMetadata } from 'src/Service';

export interface IntervalFrequency {
  cron?: string;
  zeit?: string;
}

export interface IntervalData extends BotServiceData {
  defaultContext: ContextOptions & {
    target: ServiceMetadata;
  };
  frequency: IntervalFrequency;
}

export type IntervalOptions<TData extends IntervalData> = BotServiceOptions<TData>;
export interface Interval extends Service {
  /**
   * Based on the results of the last job, run a new one.
   */
  tick(context: Context, last: Tick): Promise<number>;
}

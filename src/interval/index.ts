import { BotServiceData } from '../BotService';
import { Context, ContextOptions } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { Service, ServiceMetadata } from '../Service';

export interface IntervalFrequency {
  cron?: string;
  time?: string;
}

export interface IntervalData extends BotServiceData {
  defaultContext: ContextOptions;
  defaultTarget: ServiceMetadata;
  frequency: IntervalFrequency;
}

export interface Interval extends Service {
  /**
   * Based on the results of the last job, run a new one.
   */
  tick(context: Context, next: Tick, last?: Tick): Promise<number>;
}

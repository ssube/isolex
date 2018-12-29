import { BotServiceData, BotServiceOptions } from 'src/BotService';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { Service } from 'src/Service';

export interface IntervalData extends BotServiceData {
  frequency: {
    cron?: string;
    zeit?: string;
  };
}

export type IntervalOptions<TData extends IntervalData> = BotServiceOptions<TData>;
export interface Interval extends Service {
  /**
   * Based on the results of the last job, run a new one.
   */
  tick(context: Context, last: Tick): Promise<number>;
}

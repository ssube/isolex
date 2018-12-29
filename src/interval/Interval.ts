import { BotServiceData, BotServiceOptions } from 'src/BotService';
import { Context } from 'src/entity/Context';

export interface IntervalJob {
  createdAt: number;
  intervalId: string;
  status: number;
  updatedAt: number;
}

export interface IntervalData extends BotServiceData {
  frequency: {
    cron?: string;
    zeit?: string;
  };
}

export type IntervalOptions<TData extends IntervalData> = BotServiceOptions<TData>;
export interface Interval {
  /**
   * Based on the results of the last job, run a new one.
   */
  tick(context: Context, last: IntervalJob): Promise<number>;
}

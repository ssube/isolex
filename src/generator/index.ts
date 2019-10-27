import { BotServiceData } from '../BotService';
import { Context, ContextData, ContextRedirect } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { Service } from '../Service';
import { IntervalFrequency } from '../utils/interval';

export interface GeneratorData extends BotServiceData {
  context: ContextData;
  frequency: IntervalFrequency;
  redirect: ContextRedirect;
}

export interface Generator extends Service {
  /**
   * Based on the results of the last job, run a new one.
   */
  tick(context: Context, next: Tick, last?: Tick): Promise<number>;
}

import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { collectDefaultMetrics, Registry } from 'prom-client';

import { IntervalData } from '.';
import { INJECT_METRICS } from '../BaseService';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { InvalidArgumentError } from '../error/InvalidArgumentError';
import { mustExist } from '../utils';
import { BaseInterval, BaseIntervalOptions } from './BaseInterval';

export type MetricsIntervalData = IntervalData;

/**
 * This interval is responsible for starting collection of default metrics, clearing the registry, etc.
 */
@Inject(INJECT_METRICS)
export class MetricsInterval extends BaseInterval<MetricsIntervalData> {
  protected readonly metrics: Registry;

  constructor(options: BaseIntervalOptions<MetricsIntervalData>) {
    super(options, 'isolex#/definitions/service-interval-metrics');

    this.metrics = mustExist(options[INJECT_METRICS]);
  }

  public async startInterval() {
    if (isNil(this.data.frequency.time)) {
      throw new InvalidArgumentError('metrics interval requires a time frequency');
    }

    const timeout = this.math.unit(this.data.frequency.time).toNumber('millisecond');
    this.logger.debug({ timeout }, 'starting default metrics interval');
    this.interval = ((collectDefaultMetrics({
      register: this.metrics,
      timeout,
    }) as unknown) as NodeJS.Timeout);
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    return 0;
  }
}

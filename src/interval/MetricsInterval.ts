import { defaultTo, isNil } from 'lodash';
import { Inject } from 'noicejs';
import { collectDefaultMetrics, DefaultMetricsCollectorConfiguration, Registry } from 'prom-client';

import { IntervalData } from '.';
import { INJECT_METRICS } from '../BaseService';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { InvalidArgumentError } from '../error/InvalidArgumentError';
import { mustExist } from '../utils';
import { BaseInterval, BaseIntervalOptions } from './BaseInterval';

export type MetricsIntervalData = IntervalData;

export interface CollectorOptions extends DefaultMetricsCollectorConfiguration {
  timeout: number;
  register: Registry;
}

export type Collector = (options: CollectorOptions) => ReturnType<typeof setInterval>;

export interface MetricsIntervalOptions extends BaseIntervalOptions<MetricsIntervalData> {
  collector?: Collector;
}

/**
 * This interval is responsible for starting collection of default metrics, clearing the registry, etc.
 */
@Inject(INJECT_METRICS)
export class MetricsInterval extends BaseInterval<MetricsIntervalData> {
  protected readonly collector: Collector;
  protected readonly metrics: Registry;

  constructor(options: MetricsIntervalOptions) {
    super(options, 'isolex#/definitions/service-interval-metrics');

    // tslint:disable-next-line:deprecation
    this.collector = defaultTo(options.collector, collectDefaultMetrics);
    this.metrics = mustExist(options[INJECT_METRICS]);
  }

  public async startInterval() {
    if (isNil(this.data.frequency.time)) {
      throw new InvalidArgumentError('metrics interval requires a time frequency');
    }

    const timeout = this.math.unit(this.data.frequency.time).toNumber('millisecond');
    this.logger.debug({ timeout }, 'starting default metrics interval');
    this.interval = this.collector({
      register: this.metrics,
      timeout,
    });
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    return 0;
  }
}

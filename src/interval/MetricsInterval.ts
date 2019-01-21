import { isNil } from 'lodash';
import { Inject } from 'noicejs';
import { collectDefaultMetrics, Registry } from 'prom-client';

import { INJECT_METRICS } from 'src/BaseService';
import { Context } from 'src/entity/Context';
import { Tick } from 'src/entity/Tick';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { IntervalData } from 'src/interval';
import { BaseInterval, BaseIntervalOptions } from 'src/interval/BaseInterval';
import { mustExist } from 'src/utils';

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

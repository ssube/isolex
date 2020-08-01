import { InvalidArgumentError, isNil, mustExist } from '@apextoaster/js-utils';
import { defaultTo } from 'lodash';
import { Inject } from 'noicejs';
import { collectDefaultMetrics, Registry } from 'prom-client';

import { GeneratorData } from '.';
import { INJECT_METRICS } from '../BaseService';
import { Context } from '../entity/Context';
import { Tick } from '../entity/Tick';
import { Collector } from '../utils/Metrics';
import { BaseGenerator, BaseGeneratorOptions } from './BaseGenerator';

export interface MetricsGeneratorData extends GeneratorData {
  timeout: string;
}

export interface MetricsGeneratorOptions extends BaseGeneratorOptions<MetricsGeneratorData> {
  collector?: Collector;
}

/**
 * This interval is responsible for starting collection of default metrics, clearing the registry, etc.
 */
@Inject(INJECT_METRICS)
export class MetricsGenerator extends BaseGenerator<MetricsGeneratorData> {
  protected readonly collector: Collector;
  protected readonly metrics: Registry;

  constructor(options: MetricsGeneratorOptions) {
    super(options, 'isolex#/definitions/service-generator-metrics');

    // tslint:disable-next-line:deprecation
    this.collector = defaultTo(options.collector, collectDefaultMetrics);
    this.metrics = mustExist(options[INJECT_METRICS]);
  }

  public async startInterval() {
    if (isNil(this.data.frequency.time)) {
      throw new InvalidArgumentError('metrics interval requires a time frequency');
    }

    const timeout = this.math.unit(this.data.timeout).toNumber('millisecond');
    this.logger.debug({ timeout }, 'starting default metrics interval');
    this.collector({
      register: this.metrics,
      timeout,
    });
  }

  public async tick(context: Context, next: Tick, last?: Tick): Promise<number> {
    return 0;
  }
}

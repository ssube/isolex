import { Request, Response } from 'express';
import { Inject } from 'noicejs';
import { Registry } from 'prom-client';

import { EndpointData, Handler } from '.';
import { INJECT_METRICS } from '../BaseService';
import { CommandVerb } from '../entity/Command';
import { mustExist } from '../utils';
import { BaseEndpoint, BaseEndpointOptions } from './BaseEndpoint';

export type MetricsEndpointData = EndpointData;

@Inject(INJECT_METRICS)
export class MetricsEndpoint extends BaseEndpoint<MetricsEndpointData> {
  protected readonly metrics: Registry;

  constructor(options: BaseEndpointOptions<MetricsEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-metrics');

    this.metrics = mustExist(options[INJECT_METRICS]);
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/metrics',
    ];
  }

  @Handler(CommandVerb.Get, '/')
  public async getIndex(req: Request, res: Response): Promise<void> {
    this.logger.debug('metrics endpoint get index');

    res.set('Content-Type', this.metrics.contentType);
    res.end(this.metrics.metrics());
  }
}

import { Request, Response } from 'express';

import { Endpoint, EndpointData, Handler } from '.';
import { CommandVerb } from '../entity/Command';
import { BaseEndpoint, BaseEndpointOptions, STATUS_ERROR, STATUS_SUCCESS } from './BaseEndpoint';

export class HealthEndpoint extends BaseEndpoint<EndpointData> implements Endpoint {
  constructor(options: BaseEndpointOptions<EndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-health');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/health',
    ];
  }

  @Handler(CommandVerb.Get, '/liveness')
  public async getLiveness(req: Request, res: Response): Promise<void> {
    this.logger.debug('health endpoint get liveness');
    if (this.bot.isConnected) {
      res.sendStatus(STATUS_SUCCESS);
    } else {
      res.sendStatus(STATUS_ERROR);
    }
  }

  @Handler(CommandVerb.Get, '/readiness')
  public async getReadiness(req: Request, res: Response): Promise<void> {
    this.logger.debug('health endpoint get readiness');
    if (this.bot.getStorage().isConnected) {
      res.sendStatus(STATUS_SUCCESS);
    } else {
      res.sendStatus(STATUS_ERROR);
    }
  }
}

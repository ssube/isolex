import { Request, Response, Router } from 'express';

import { Endpoint, EndpointData } from '.';
import { BotServiceOptions } from '../BotService';
import { BaseEndpoint } from './BaseEndpoint';

export const STATUS_SUCCESS = 200;
export const STATUS_ERROR = 500;

export class HealthEndpoint extends BaseEndpoint<EndpointData> implements Endpoint {
  constructor(options: BotServiceOptions<EndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-health');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/health',
    ];
  }

  public async createRouter(): Promise<Router> {
    this.router.route('/liveness').get(this.nextRoute(this.getLiveness.bind(this)));
    this.router.route('/readiness').get(this.nextRoute(this.getReadiness.bind(this)));
    return this.router;
  }

  public async getLiveness(req: Request, res: Response): Promise<void> {
    this.logger.debug('health endpoint get liveness');
    if (this.bot.isConnected) {
      res.status(STATUS_SUCCESS);
    } else {
      res.status(STATUS_ERROR);
    }
  }

  public async getReadiness(req: Request, res: Response): Promise<void> {
    this.logger.debug('health endpoint get readiness');
    if (this.bot.getStorage().isConnected) {
      res.status(STATUS_SUCCESS);
    } else {
      res.status(STATUS_ERROR);
    }
  }
}

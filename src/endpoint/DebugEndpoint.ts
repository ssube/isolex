import { Request, Response, Router } from 'express';

import { Endpoint, EndpointData } from '.';
import { BotServiceOptions } from '../BotService';
import { BaseEndpoint } from './BaseEndpoint';

export class DebugEndpoint extends BaseEndpoint<EndpointData> implements Endpoint {
  constructor(options: BotServiceOptions<EndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-debug');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/debug',
    ];
  }

  public async createRouter(): Promise<Router> {
    this.router.route('/').get(this.nextRoute(this.getIndex.bind(this)));
    return this.router;
  }

  public async getIndex(req: Request, res: Response): Promise<void> {
    const svcs = [];
    for (const [key, svc] of this.services.listServices()) {
      svcs.push({
        data: Reflect.get(svc, 'data'),
        id: svc.id,
        key,
        kind: svc.kind,
        name: svc.name,
      });
    }
    res.json(svcs);
  }
}

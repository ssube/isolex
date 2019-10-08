import { Request, Response } from 'express';

import { Endpoint, EndpointData, Handler } from '.';
import { BotServiceOptions } from '../BotService';
import { CommandVerb } from '../entity/Command';
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

  @Handler(CommandVerb.Get, '/')
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

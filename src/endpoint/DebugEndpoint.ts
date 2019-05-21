import { IRoute, Request, Response } from 'express';

import { BotServiceOptions } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';
import { BaseEndpoint } from 'src/endpoint/BaseEndpoint';

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

  public register(router: IRoute): void {
    router.get((req: Request, res: Response) => {
      const svcs = [];
      for (const [key, svc] of this.services.listServices()) {
        svcs.push({
          data: Reflect.get(svc, 'data'),
          key,
          kind: svc.kind,
          name: svc.name,
          id: svc.id,
        });
      }
      res.json(svcs);
    });
  }
}
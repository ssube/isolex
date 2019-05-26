import { Request, Response, Router } from 'express';

import { BotServiceOptions } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';
import { BaseEndpoint } from 'src/endpoint/BaseEndpoint';
import { User } from 'src/entity/auth/User';

export class EchoEndpoint extends BaseEndpoint<EndpointData> implements Endpoint {
  constructor(options: BotServiceOptions<EndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-echo');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/echo',
    ];
  }

  public createRouter(): Promise<Router> {
    const router = Router();
    router.route('/').get((req: Request, res: Response) => this.getIndex(req, res));
    return Promise.resolve(router);
  }

  public getIndex(req: Request, res: Response) {
    this.logger.debug('echo endpoint get index');
    if (req.user) {
      const user = req.user as User;
      res.send(`Hello ${user.name}!`);
    } else {
      res.send('Hello World!');
    }
  }
}

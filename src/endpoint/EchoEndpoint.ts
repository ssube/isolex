import { Request, Response } from 'express';

import { Endpoint, EndpointData, Handler } from '.';
import { BotServiceOptions } from '../BotService';
import { User } from '../entity/auth/User';
import { CommandVerb } from '../entity/Command';
import { doesExist } from '../utils';
import { BaseEndpoint } from './BaseEndpoint';

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

  @Handler(CommandVerb.Get, '/')
  public async getIndex(req: Request, res: Response): Promise<void> {
    this.logger.debug('echo endpoint get index');
    if (doesExist(req.user)) {
      const user = req.user as User;
      res.send(`Hello ${user.name}!`);
    } else {
      res.send('Hello World!');
    }
  }
}

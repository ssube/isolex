import { Request, Response } from 'express';
import { Inject } from 'noicejs';

import { Handler } from '.';
import { INJECT_STORAGE } from '../BotService';
import { CommandVerb } from '../entity/Command';
import { BaseEndpoint, BaseEndpointOptions, STATUS_SUCCESS } from './BaseEndpoint';
import { HookEndpointData } from './HookEndpoint';

export interface GithubEndpointData extends HookEndpointData {
  secret: string;
}

export type GithubEndpointOptions = BaseEndpointOptions<GithubEndpointData>;

@Inject(INJECT_STORAGE)
export class GithubEndpoint extends BaseEndpoint<GithubEndpointData> {
  constructor(options: BaseEndpointOptions<GithubEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-github');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/github',
    ];
  }

  @Handler(CommandVerb.Create, '/webhook')
  public async postWebhook(req: Request, res: Response): Promise<void> {
    const eventType = req.header('X-GitHub-Event');
    const eventId = req.header('X-GitHub-Delivery');
    const eventData = req.body;
    this.logger.info({
      eventData,
      eventId,
      eventType,
    }, 'received github webhook');
    res.sendStatus(STATUS_SUCCESS);
  }
}

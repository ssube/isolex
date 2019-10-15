import { Request, Response } from 'express';
import { Inject } from 'noicejs';
import { Counter } from 'prom-client';

import { Handler } from '.';
import { INJECT_METRICS } from '../BaseService';
import { INJECT_STORAGE } from '../BotService';
import { CommandVerb } from '../entity/Command';
import { mustExist } from '../utils';
import { createServiceCounter, incrementServiceCounter } from '../utils/Metrics';
import { BaseEndpoint, BaseEndpointOptions, STATUS_SUCCESS } from './BaseEndpoint';
import { HookEndpointData } from './HookEndpoint';

export interface GithubEndpointData extends HookEndpointData {
  secret: string;
}

export type GithubEndpointOptions = BaseEndpointOptions<GithubEndpointData>;

@Inject(INJECT_METRICS, INJECT_STORAGE)
export class GithubEndpoint extends BaseEndpoint<GithubEndpointData> {
  protected readonly hookCounter: Counter;

  constructor(options: BaseEndpointOptions<GithubEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-github');

    this.hookCounter = createServiceCounter(mustExist(options[INJECT_METRICS]), {
      help: 'webhook events received from github',
      labelNames: ['eventType'],
      name: 'endpoint_github_hook',
    });
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
    incrementServiceCounter(this, this.hookCounter, {
      eventType,
    });
    res.sendStatus(STATUS_SUCCESS);
  }
}

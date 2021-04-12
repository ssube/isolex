import { mustExist } from '@apextoaster/js-utils';
import { Request, Response } from 'express';
import { Inject } from 'noicejs';

import { Handler } from '.';
import { INJECT_METRICS } from '../BaseService';
import { INJECT_STORAGE } from '../BotService';
import { Command, CommandOptions, CommandVerb } from '../entity/Command';
import { Context } from '../entity/Context';
import { createServiceCounter, incrementServiceCounter, StringCounter } from '../utils/Metrics';
import { TemplateScope } from '../utils/Template';
import { BaseEndpointOptions, STATUS_SUCCESS } from './BaseEndpoint';
import { HookEndpoint, HookEndpointData } from './HookEndpoint';

export interface GithubEndpointData extends HookEndpointData {
  defaultCommand: CommandOptions;
  secret: string;
}

export type GithubEndpointOptions = BaseEndpointOptions<GithubEndpointData>;

/* eslint-disable @typescript-eslint/no-explicit-any */
@Inject(INJECT_METRICS, INJECT_STORAGE)
export class GithubEndpoint extends HookEndpoint<GithubEndpointData> {
  protected readonly hookCounter: StringCounter;

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

    switch (eventType) {
      case 'check_run':
        return this.checkRunHook(req, res, eventData);
      case 'check_suite':
        return this.checkSuiteHook(req, res, eventData);
      case 'pull_request_review':
        return this.pullReviewHook(req, res, eventData);
      case 'status':
        return this.statusHook(req, res, eventData);
      default:
        this.logger.warn({
          kind: eventType,
        }, 'unknown hook kind');
        res.sendStatus(STATUS_SUCCESS);
    }
  }

  public async checkRunHook(req: Request, res: Response, data: any): Promise<void> {
    this.logger.debug(data, 'github check run hook');
    const user = mustExist(this.hookUser);
    const ctx = await this.createContext({
      channel: {
        id: data.repository.full_name,
        thread: data.check_run.head_sha,
      },
      source: this.getMetadata(),
      sourceUser: {
        name: data.sender.login,
        uid: this.data.hookUser,
      },
      user,
    });
    const cmd = await this.createHookCommand(ctx, data, 'check_run');
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  public async checkSuiteHook(req: Request, res: Response, data: any): Promise<void> {
    this.logger.debug(data, 'github check suite hook');
    const user = mustExist(this.hookUser);
    const ctx = await this.createContext({
      channel: {
        id: data.repository.full_name,
        thread: data.check_suite.head_sha,
      },
      source: this.getMetadata(),
      sourceUser: {
        name: data.sender.login,
        uid: this.data.hookUser,
      },
      user,
    });
    const cmd = await this.createHookCommand(ctx, data, 'check_suite');
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  public async pullReviewHook(req: Request, res: Response, data: any): Promise<void> {
    this.logger.debug(data, 'github pull review hook');
    const user = mustExist(this.hookUser);
    const ctx = await this.createContext({
      channel: {
        id: data.repository.full_name,
        thread: data.pull_request.number,
      },
      source: this.getMetadata(),
      sourceUser: {
        name: data.sender.login,
        uid: this.data.hookUser,
      },
      user,
    });
    const cmd = await this.createHookCommand(ctx, data, 'pull_request_review');
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  public async statusHook(req: Request, res: Response, data: any): Promise<void> {
    this.logger.debug(data, 'github commit status hook');
    const user = mustExist(this.hookUser);
    const ctx = await this.createContext({
      channel: {
        id: data.repository.full_name,
        thread: data.sha,
      },
      source: this.getMetadata(),
      sourceUser: {
        name: data.sender.login,
        uid: this.data.hookUser,
      },
      user,
    });
    const cmd = await this.createHookCommand(ctx, data, 'status');
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  protected async createHookCommand(context: Context, data: TemplateScope, kind: string): Promise<Command> {
    const labels = new Map(this.labels);
    labels.set('hook', kind);

    return new Command({
      context,
      data,
      labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    });
  }
}

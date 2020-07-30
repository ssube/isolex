import { mustExist } from '@apextoaster/js-utils';
import { Request, Response } from 'express';
import { isString } from 'lodash';
import { Inject } from 'noicejs';

import { Endpoint, Handler } from '.';
import { INJECT_METRICS } from '../BaseService';
import { Command, CommandOptions, CommandVerb } from '../entity/Command';
import { ChannelData, Context } from '../entity/Context';
import { Message } from '../entity/Message';
import { applyTransforms } from '../transform';
import { createServiceCounter, incrementServiceCounter, StringCounter } from '../utils/Metrics';
import { TYPE_JSON } from '../utils/Mime';
import { TemplateScope } from '../utils/Template';
import { BaseEndpointOptions, STATUS_NOTFOUND, STATUS_SUCCESS } from './BaseEndpoint';
import { HookEndpoint, HookEndpointData } from './HookEndpoint';

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any, camelcase */

export interface GitlabBaseWebhook {
  object_kind: string;
}

export interface GitlabIssueWebhook extends GitlabBaseWebhook {
  object_kind: 'issue';
  user: any;
  project: any;
  repository: any;
  object_attributes: any;
  assignees: Array<any>;
  assignee: any;
  labels: Array<any>;
  changes: any;
}

export interface GitlabBuildWebhook extends GitlabBaseWebhook {
  object_kind: 'build';
  ref: string;
  tag: boolean;
  before_sha: string;
  sha: string;
  job_id: number;
  job_name: string;
  job_stage: string;
  job_status: string; // TODO: enum
  job_started_at: any;
  job_finished_at: any;
  job_duration: any;
  job_allow_failure: boolean;
  project_id: number;
  project_name: string;
  user: any;
  commit: any;
  repository: any;
}

export interface GitlabNoteWebhook extends GitlabBaseWebhook {
  object_kind: 'note';
  user: any;
  project: any;
  repository: any;
  object_attributes: any;
  commit: any;
}

export interface GitlabPipelineWebhook extends GitlabBaseWebhook {
  object_kind: 'pipeline';
  object_attributes: any;
  user: any;
  project: any;
  commit: any;
  builds: Array<any>;
}

export interface GitlabPushWebhook extends GitlabBaseWebhook {
  object_kind: 'push';
  before: string;
  after: string;
  ref: string;
  checkout_sha: string;
  user_id: number;
  user_name: string;
  user_username: string;
  user_email: string;
  user_avatar: string;
  project_id: number;
  project: any;
  repository: any;
  commits: Array<any>;
  total_commits_count: number;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type GitlabWebhook = GitlabBuildWebhook | GitlabIssueWebhook | GitlabNoteWebhook | GitlabPipelineWebhook | GitlabPushWebhook;

export interface GitlabEndpointData extends HookEndpointData {
  defaultCommand: CommandOptions;
}

@Inject(INJECT_METRICS)
export class GitlabEndpoint extends HookEndpoint<GitlabEndpointData> implements Endpoint {
  protected readonly hookCounter: StringCounter;

  constructor(options: BaseEndpointOptions<GitlabEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-gitlab');

    this.hookCounter = createServiceCounter(mustExist(options[INJECT_METRICS]), {
      help: 'webhook events received from gitlab',
      labelNames: ['eventType'],
      name: 'endpoint_gitlab_hook',
    });
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/gitlab',
    ];
  }

  @Handler(CommandVerb.Create, '/webhook')
  public async postHook(req: Request, res: Response) {
    const hook: GitlabBaseWebhook = req.body;
    return this.hookKind(req, res, hook);
  }

  public async hookKind(req: Request, res: Response, data: GitlabBaseWebhook) {
    this.logger.debug({
      body: req.body,
      eventType: data.object_kind,
      req,
      res,
    }, 'gitlab endpoint got webhook');
    incrementServiceCounter(this, this.hookCounter, {
      eventType: data.object_kind,
    });

    switch (data.object_kind) {
      case 'build':
        return this.buildHook(req, res, data as GitlabBuildWebhook);
      case 'issue':
        return this.issueHook(req, res, data as GitlabIssueWebhook);
      case 'note':
        return this.noteHook(req, res, data as GitlabNoteWebhook);
      case 'pipeline':
        return this.pipelineHook(req, res, data as GitlabPipelineWebhook);
      case 'push':
        return this.pushHook(req, res, data as GitlabPushWebhook);
      default:
        this.logger.warn({
          kind: data.object_kind,
        }, 'unknown hook kind');
        res.sendStatus(STATUS_NOTFOUND);
    }
  }

  public async buildHook(req: Request, res: Response, data: GitlabBuildWebhook) {
    this.logger.debug(data, 'gitlab job hook');
    const txData = await this.transformData(req, res, data);
    const user = mustExist(this.hookUser);
    const cmdCtx = await this.createContext({
      channel: {
        id: data.project_name,
        thread: data.ref,
      },
      name: user.name,
      uid: this.data.hookUser,
      user,
    });
    const cmd = await this.createHookCommand(cmdCtx, txData, data.object_kind);
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  // tslint:disable-next-line:no-identical-functions
  public async issueHook(req: Request, res: Response, data: GitlabIssueWebhook) {
    this.logger.debug(data, 'gitlab issue hook');
    const txData = await this.transformData(req, res, data);
    const user = mustExist(this.hookUser);
    const cmdCtx = await this.createContext({
      channel: {
        id: data.project.id,
        thread: data.object_attributes.id,
      },
      name: user.name,
      uid: this.data.hookUser,
      user,
    });
    const cmd = await this.createHookCommand(cmdCtx, txData, data.object_kind);
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  // tslint:disable-next-line:no-identical-functions
  public async noteHook(req: Request, res: Response, data: GitlabNoteWebhook) {
    this.logger.debug(data, 'gitlab note hook');
    const txData = await this.transformData(req, res, data);
    const user = mustExist(this.hookUser);
    const cmdCtx = await this.createContext({
      channel: {
        id: data.project.id,
        thread: data.object_attributes.id,
      },
      name: user.name,
      uid: this.data.hookUser,
      user,
    });
    const cmd = await this.createHookCommand(cmdCtx, txData, data.object_kind);
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  public async pipelineHook(req: Request, res: Response, data: GitlabPipelineWebhook) {
    this.logger.debug(data, 'gitlab pipeline hook');
    const txData = await this.transformData(req, res, data);
    const cmdCtx = await this.createContext({
      channel: {
        id: data.project.web_url,
        thread: data.object_attributes.ref,
      },
      name: data.user.name,
      uid: data.user.username,
      user: mustExist(this.hookUser),
    });
    const cmd = await this.createHookCommand(cmdCtx, txData, data.object_kind);
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  public async pushHook(req: Request, res: Response, data: GitlabPushWebhook) {
    this.logger.debug(data, 'gitlab push hook');
    const txData = await this.transformData(req, res, data);
    const cmdCtx = await this.createContext({
      channel: {
        id: data.project.web_url,
        thread: data.ref,
      },
      name: data.user_name,
      uid: data.user_username,
      user: mustExist(this.hookUser),
    });
    const cmd = await this.createHookCommand(cmdCtx, txData, data.object_kind);
    await this.bot.executeCommand(cmd);
    res.sendStatus(STATUS_SUCCESS);
  }

  protected async transformData(req: Request, res: Response, data: GitlabWebhook) {
    const msg = await this.createHookMessage(req, res, data);

    const txData = await applyTransforms(this.transforms, msg, TYPE_JSON, data);
    this.logger.debug({ data, txData }, 'applied transforms');

    if (Array.isArray(txData) || isString(txData)) {
      this.logger.warn({ data: txData }, 'transforms did not return object');
    }

    return txData;
  }

  protected getHookChannel(data: GitlabWebhook): ChannelData {
    return {
      id: data.object_kind,
      thread: '',
    };
  }

  protected async createHookMessage(req: Request, res: Response, data: GitlabWebhook): Promise<Message> {
    const channel = this.getHookChannel(data);
    const context = await this.createHookContext(channel);
    const labels = new Map(this.labels);
    labels.set('hook', data.object_kind);

    // fake message for the transforms to check and filter
    return new Message({
      body: data.object_kind,
      context,
      labels,
      reactions: [],
      type: TYPE_JSON,
    });
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

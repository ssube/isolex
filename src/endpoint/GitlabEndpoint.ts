import { json as expressJSON, Request, Response, Router } from 'express';

import { BotServiceOptions } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';
import { BaseEndpoint } from 'src/endpoint/BaseEndpoint';
import { Command, CommandVerb, CommandOptions } from 'src/entity/Command';
import { applyTransforms } from 'src/transform/helpers';
import { Message } from 'src/entity/Message';
import { TYPE_JSON } from 'src/utils/Mime';
import { mapToDict, dictValuesToArrays, Dict } from 'src/utils/Map';
import { isString } from 'lodash';

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

export interface GitlabJobWebhook extends GitlabBaseWebhook {
  object_kind: 'job';
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

export interface GitlabEndpointData extends EndpointData {
  defaultCommand: CommandOptions;
}

export class GitlabEndpoint extends BaseEndpoint<GitlabEndpointData> implements Endpoint {
  constructor(options: BotServiceOptions<GitlabEndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-gitlab');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/gitlab',
    ];
  }

  public createRouter(): Promise<Router> {
    const router = Router();
    router.use(expressJSON());
    router.route('/hook').post((req: Request, res: Response) => {
      this.logger.debug({
        req,
        res,
      }, 'gitlab endpoint got webhook');

      // authenticate & authorize

      const hook: GitlabBaseWebhook = req.body;
      return this.hookKind(req, res, hook);
    });
    return Promise.resolve(router);
  }

  public async hookKind(req: Request, res: Response, data: GitlabBaseWebhook) {
    switch (data.object_kind) {
      case 'issue':
        return this.issueHook(req, res, data as GitlabIssueWebhook);
      case 'job':
        return this.jobHook(req, res, data as GitlabJobWebhook);
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
    }
  }

  public async issueHook(req: Request, res: Response, data: GitlabIssueWebhook) {
    this.logger.debug(data, 'gitlab issue hook');
    res.sendStatus(200);
  }

  public async jobHook(req: Request, res: Response, data: GitlabJobWebhook) {
    this.logger.debug(data, 'gitlab job hook');
    res.sendStatus(200);
  }

  public async noteHook(req: Request, res: Response, data: GitlabNoteWebhook) {
    this.logger.debug(data, 'gitlab note hook');
    res.sendStatus(200);
  }

  public async pipelineHook(req: Request, res: Response, data: GitlabPipelineWebhook) {
    this.logger.debug(data, 'gitlab pipeline hook');
    res.sendStatus(200);
  }

  public async pushHook(req: Request, res: Response, data: GitlabPushWebhook) {
    this.logger.debug(data, 'gitlab push hook');
    const context = await this.createContext({
      channel: {
        id: data.project.web_url,
        thread: data.ref,
      },
      name: data.user_name,
      uid: data.user_username,
    });
    // fake message for the transforms to check and filter
    const msg = new Message({
      context,
      body: data.object_kind,
      labels: this.labels,
      reactions: [],
      type: TYPE_JSON,
    });
    const txData = await applyTransforms(this.transforms, msg, TYPE_JSON, data);
    if (Array.isArray(txData) || isString(txData)) {
      this.logger.warn({data: txData}, 'transforms did not return object');
    }
    const cmd = new Command({
      context,
      data: dictValuesToArrays(txData as Dict<string>),
      labels: this.labels,
      noun: this.data.defaultCommand.noun,
      verb: this.data.defaultCommand.verb,
    });
    await this.bot.executeCommand(cmd);
    res.sendStatus(200);
  }
}

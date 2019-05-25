import { IRoute, Request, Response } from 'express';

import { BotServiceOptions } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';
import { BaseEndpoint } from 'src/endpoint/BaseEndpoint';

export interface GitlabBaseWebhook {
  object_kind: string;
}

export interface GitlabIssueWebhook extends GitlabBaseWebhook {
  object_kind: 'issue',
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
  object_kind: 'job',
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
  object_kind: 'note',
  user: any;
  project: any;
  repository: any;
  object_attributes: any;
  commit: any;
}

export interface GitlabPushWebhook extends GitlabBaseWebhook {
  object_kind: 'push',
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

export class GitlabEndpoint extends BaseEndpoint<EndpointData> implements Endpoint {
  constructor(options: BotServiceOptions<EndpointData>) {
    super(options, 'isolex#/definitions/service-endpoint-gitlab');
  }

  public get paths(): Array<string> {
    return [
      ...super.paths,
      '/gitlab',
    ];
  }

  public register(router: IRoute): void {
    router.get((req: Request, res: Response) => {
      this.logger.debug('gitlab endpoint got webhook');

      // authenticate & authorize

      const hook: GitlabBaseWebhook = req.body;
      // switch on hook kind
      switch (hook.object_kind) {
        case 'issue':
          this.issueHook(req, res, hook as GitlabIssueWebhook);
        case 'job':
          this.jobHook(req, res, hook as GitlabJobWebhook);
        case 'note':
          // switch on target kind
        case 'push':
          this.pushHook(req, res, hook as GitlabPushWebhook);
      }
    });
  }

  public issueHook(req: Request, res: Response, data: GitlabIssueWebhook) {
    this.logger.debug(data, 'gitlab issue hook');
  }

  public jobHook(req: Request, res: Response, data: GitlabJobWebhook) {
    this.logger.debug(data, 'gitlab job hook');
  }

  public pushHook(req: Request, res: Response, data: GitlabPushWebhook) {
    this.logger.debug(data, 'gitlab push hook');
  }
}

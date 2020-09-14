import { doesExist, mustExist } from '@apextoaster/js-utils';
import { isNil } from 'lodash';
import { Container } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { GithubClient, GithubClientData } from '../../utils/github';
import { BaseController, BaseControllerOptions } from '../BaseController';

export const NOUN_APPROVE = 'github-approve';

export interface ProjectRef {
  owner: string;
  ref: string;
  repo: string;
}

export interface CheckData {
  app: string;
  conclusion: string;
  name: string;
  status: string;
}

export interface CheckStatus {
  app: string;
  name: string;
  status: boolean;
}

export interface RefResult {
  checks: Array<CheckStatus>;
  errors: Array<CheckStatus>;
  success: boolean;
}

export interface GithubApproveControllerData extends ControllerData {
  client: GithubClientData;
  projects: Array<{
    authors: Array<string>;
    checks: Array<CheckData>;
    owner: string;
    project: string;
  }>;
}

export class GithubApproveController extends BaseController<GithubApproveControllerData> implements Controller {
  protected client?: GithubClient;
  protected readonly container: Container;

  constructor(options: BaseControllerOptions<GithubApproveControllerData>) {
    super(options, 'isolex#/definitions/service-controller-github-approve', [NOUN_APPROVE]);
    this.container = options.container;
  }

  public async start() {
    await super.start();

    this.client = await this.container.create(GithubClient, {
      data: this.data.client,
    });
  }

  @Handler(NOUN_APPROVE, CommandVerb.Create)
  @CheckRBAC()
  public async approveRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const request = cmd.getHeadOrNumber('request', 0);

    const client = mustExist(this.client).client;
    const pull = await client.pulls.get({
      owner,
      /* eslint-disable-next-line camelcase, @typescript-eslint/naming-convention */
      pull_number: request,
      repo: project,
    });

    const options = {
      owner,
      ref: pull.data.head.sha,
      repo: project,
    };

    const checkStatus = await this.checkRef(options, pull.data.user.login);
    if (checkStatus.success) {
      return this.reply(ctx, 'all checks passed!');
    } else {
      const errors = checkStatus.errors.map((err) => {
        if (err.app !== err.name) {
          return `${err.app}/${err.name}`;
        } else {
          return err.name;
        }
      }).sort();

      const body = ['some checks failed', ...errors].join('\n- ');
      return this.reply(ctx, body);
    }
  }

  public async checkRef(options: ProjectRef, author: string): Promise<RefResult> {
    const client = mustExist(this.client).client;

    const checkPromise = client.checks.listForRef(options);
    const statusPromise = client.repos.getCombinedStatusForRef(options);
    const [checkData, statusData] = await Promise.all([checkPromise, statusPromise]);

    const checks = checkData.data.check_runs.map((it) => ({
      app: it.app.slug,
      conclusion: it.conclusion,
      name: it.name,
      status: it.status,
    }));
    const statuses = statusData.data.statuses.map((it) => ({
      app: it.context,
      conclusion: it.state,
      name: it.context,
      status: it.state,
    }));

    const results = [...checks, ...statuses];
    this.logger.debug({ results, options }, 'collected request results');

    const projectData = this.data.projects.find((it) => it.owner === options.owner && it.project === options.repo);
    if (isNil(projectData)) {
      return {
        checks: [],
        errors: [{
          app: 'meta',
          name: 'project not found',
          status: false,
        }],
        success: false,
      };
    }

    if (!projectData.authors.includes(author)) {
      return {
        checks: [],
        errors: [{
          app: 'meta',
          name: 'author not trusted',
          status: false,
        }],
        success: false,
      };
    }

    const status = projectData.checks.map((check) => {
      const result = results.find((r) => r.app === check.app && r.name === check.name);
      return {
        app: check.app,
        name: check.name,
        status: doesExist(result) && check.conclusion === result.conclusion && check.status === result.status,
      };
    });
    const errors = status.filter((it) => !it.status);

    return {
      checks: status,
      errors,
      success: errors.length === 0,
    };
  }
}

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
  status: boolean;
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

export interface PullRequest {
  owner: string;
  /* eslint-disable-next-line camelcase, @typescript-eslint/naming-convention */
  pull_number: number;
  repo: string;
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
  public async approveRefOrRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const repo = cmd.getHead('project');
    const request = cmd.getHeadOrNumber('request', 0);

    if (request === 0) {
      const head = cmd.getHead('head');
      const client = mustExist(this.client).client;
      const pulls = await client.pulls.list({
        head,
        owner,
        repo,
      });
      this.logger.debug({
        head,
        owner,
        pulls: pulls.data.length,
        repo,
      }, 'approving multiple pull requests for branch');

      for (const p of pulls.data) {
        await this.approveRequest(ctx, {
          owner,
          /* eslint-disable-next-line camelcase, @typescript-eslint/naming-convention */
          pull_number: p.number,
          repo,
        });
      }
    } else {
      const options = {
        owner,
        /* eslint-disable-next-line camelcase, @typescript-eslint/naming-convention */
        pull_number: request,
        repo,
      };
      this.logger.debug(options, 'approving single pull request');
      await this.approveRequest(ctx, options);
    }
  }

  public async approveRequest(ctx: Context, options: PullRequest): Promise<void> {
    const client = mustExist(this.client).client;
    const pull = await client.pulls.get(options);
    const checkStatus = await this.checkRef({
      owner: options.owner,
      ref: pull.data.head.sha,
      repo: options.repo,
    }, pull.data.user.login);

    if (checkStatus.status) {
      await client.pulls.createReview({
        ...options,
        event: 'APPROVE',
      });
      return this.reply(ctx, 'all checks passed!');
    }

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

  public async checkRef(options: ProjectRef, author: string): Promise<RefResult> {
    const results = await this.collectChecks(options);
    const project = this.data.projects.find((it) => it.owner === options.owner && it.project === options.repo);
    if (isNil(project)) {
      return errorResult({
        app: 'meta',
        name: 'project not found',
        status: false,
      });
    }

    if (project.authors.includes(author) === false) {
      return errorResult({
        app: 'meta',
        name: 'author not trusted',
        status: false,
      });
    }

    const checks = project.checks.map((check) => {
      const result = results.find((r) => r.app === check.app && r.name === check.name);
      const status = doesExist(result) && check.conclusion === result.conclusion && check.status === result.status;
      return {
        app: check.app,
        name: check.name,
        status,
      };
    });
    const errors = checks.filter((it) => it.status === false);
    const status = errors.length === 0;

    this.logger.debug({
      errors,
      status,
    }, 'tested check results for ref');

    return {
      checks,
      errors,
      status: errors.length === 0,
    };
  }

  public async collectChecks(options: ProjectRef): Promise<Array<CheckData>> {
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
    this.logger.debug({ results, options }, 'collected check results');

    return results;
  }
}

export function errorResult(status: CheckStatus): RefResult {
  return {
    checks: [],
    errors: [status],
    status: false,
  };
}

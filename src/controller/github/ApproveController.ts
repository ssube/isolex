import { mustExist, mustFind } from '@apextoaster/js-utils';
import { isNil } from 'lodash';
import { Container } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { GithubClient, GithubClientData } from '../../utils/github';
import { BaseController, BaseControllerOptions } from '../BaseController';

export const NOUN_APPROVE = 'github-approve';

export interface GithubApproveControllerData extends ControllerData {
  client: GithubClientData;
  projects: Array<{
    authors: Array<string>;
    checks: Array<{
      app: string;
      conclusion: string;
      name: string;
      status: string;
    }>;
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

    const projectData = this.data.projects.find((it) => it.owner === owner && it.project === project);
    if (isNil(projectData)) {
      return this.reply(ctx, `project not found\n${JSON.stringify(results)}`);
    }

    const author = pull.data.user.login;
    if (!projectData.authors.includes(author)) {
      return this.reply(ctx, `request author not trusted: ${author}`);
    }

    const checkStatus = projectData.checks.map((check) => {
      const result = mustFind(results, (r) => r.app === check.app && r.name === check.name);
      return {
        name: check.name,
        status: check.conclusion === result.conclusion && check.status === result.status,
      };
    });

    if (checkStatus.every((cr) => cr.status)) {
      return this.reply(ctx, 'all checks passed!');
    } else {
      const errors = checkStatus.filter((cr) => !cr.status);
      return this.reply(ctx, `some checks failed:\n${JSON.stringify(errors)}`);
    }
  }
}

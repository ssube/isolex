import { Container } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { mustExist } from '../../utils';
import { GithubClient, GithubClientData } from '../../utils/github';
import { BaseController, BaseControllerOptions } from '../BaseController';

export const NOUN_COMMIT = 'github-commit';

export interface GithubCommitControllerData extends ControllerData {
  client: GithubClientData;
}

export class GithubCommitController extends BaseController<GithubCommitControllerData> implements Controller {
  protected client?: GithubClient;
  protected readonly container: Container;

  constructor(options: BaseControllerOptions<GithubCommitControllerData>) {
    super(options, 'isolex#/definitions/service-controller-github-commit', []);
    this.container = options.container;
  }

  public async start() {
    await super.start();

    this.client = await this.container.create(GithubClient, {
      data: this.data.client,
    });
  }

  @Handler(NOUN_COMMIT, CommandVerb.Get)
  @CheckRBAC()
  public async getCommit(cmd: Command, ctx: Context): Promise<void> {
    const client = mustExist(this.client).client;
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const repo = cmd.getHead('project');
    const ref = cmd.getHead('ref');

    const checkPromise = client.checks.listForRef({
      owner,
      ref,
      repo,
    });
    const statusPromise = client.repos.getCombinedStatusForRef({
      owner,
      ref,
      repo,
    });

    const [checks, status] = await Promise.all([checkPromise, statusPromise]);
    const txd = JSON.stringify({
      checks,
      status,
    });
    return this.reply(ctx, txd);
  }
}

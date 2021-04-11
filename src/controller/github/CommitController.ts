import { mustExist } from '@apextoaster/js-utils';
import { Container } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { applyTransforms, extractBody } from '../../transform';
import { GithubClient, GithubClientData } from '../../utils/github';
import { TYPE_JSON } from '../../utils/Mime';
import { BaseController, BaseControllerOptions } from '../BaseController';

export const NOUN_COMMIT = 'github-commit';

export interface GithubCommitControllerData extends ControllerData {
  client: GithubClientData;
}

export class GithubCommitController extends BaseController<GithubCommitControllerData> implements Controller {
  protected client?: GithubClient;
  protected readonly container: Container;

  constructor(options: BaseControllerOptions<GithubCommitControllerData>) {
    super(options, 'isolex#/definitions/service-controller-github-commit', [NOUN_COMMIT]);
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
    const owner = cmd.getHeadOrDefault('owner', ctx.sourceUser.name);
    const project = cmd.getHead('project');
    const ref = cmd.getHead('ref');

    const options = {
      owner,
      ref,
      repo: project,
    };
    const checkPromise = client.checks.listForRef(options);
    const statusPromise = client.repos.getCombinedStatusForRef(options);
    const [checks, status] = await Promise.all([checkPromise, statusPromise]);

    const txd = await applyTransforms(this.transforms, cmd, TYPE_JSON, {
      checks: checks.data,
      owner,
      project,
      ref,
      status: status.data,
    });
    const body = extractBody(txd);

    return this.reply(ctx, body);
  }
}

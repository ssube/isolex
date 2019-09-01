import * as Octokit from '@octokit/rest';
import { Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { GithubClientData } from '../../utils/github';
import { BaseController, BaseControllerOptions } from '../BaseController';

export const NOUN_PULL_REQUEST = 'github-pull-request';

export interface GithubPRControllerData extends ControllerData {
  client: GithubClientData;
}

@Inject()
export class GithubPRController extends BaseController<GithubPRControllerData> implements Controller {
  protected readonly client: Octokit;

  constructor(options: BaseControllerOptions<GithubPRControllerData>) {
    super(options, 'isolex#/definitions/service-controller-github-pr', [NOUN_PULL_REQUEST]);

    this.client = new Octokit({
      headers: {
        accept: 'application/vnd.github.ocelot-preview+json',
        authorization: `token ${options.data.client.token}`,
      },
    });
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    this.logger.debug({ owner, project, requestNumber }, 'closing pull request');
    await this.client.pulls.update({
      number: requestNumber,
      owner,
      repo: project,
      state: 'closed',
    });

    return this.reply(ctx, `closed pull request ${requestNumber}`);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Get)
  @CheckRBAC()
  public async getRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    const response = await this.client.pulls.get({
      number: requestNumber,
      owner,
      repo: project,
    });
    return this.transformJSON(cmd, [response.data]);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.List)
  @CheckRBAC()
  public async listRequests(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');

    const response = await this.client.pulls.list({
      owner,
      repo: project,
    });
    return this.transformJSON(cmd, response.data);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Update)
  @CheckRBAC()
  public async updateRequest(cmd: Command, ctx: Context): Promise<void> {
    const message = cmd.getHead('message');
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    this.logger.debug({ owner, project, requestNumber }, 'merging pull request');
    await this.client.pulls.merge({
      commit_message: message,
      commit_title: message,
      number: requestNumber,
      owner,
      repo: project,
    });
    return this.reply(ctx, `merged pull request ${requestNumber}`);
  }
}

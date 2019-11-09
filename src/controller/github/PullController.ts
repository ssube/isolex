import { Container } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { mustExist } from '../../utils';
import { GithubClient, GithubClientData } from '../../utils/github';
import { BaseController, BaseControllerOptions, ErrorReplyType } from '../BaseController';

export const NOUN_PULL_REQUEST = 'github-pull-request';

export interface GithubPullControllerData extends ControllerData {
  client: GithubClientData;
}

export class GithubPullController extends BaseController<GithubPullControllerData> implements Controller {
  protected client?: GithubClient;
  protected readonly container: Container;

  constructor(options: BaseControllerOptions<GithubPullControllerData>) {
    super(options, 'isolex#/definitions/service-controller-github-pull', [NOUN_PULL_REQUEST]);
    this.container = options.container;
  }

  public async start() {
    await super.start();

    this.client = await this.container.create(GithubClient, {
      data: this.data.client,
    });
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    this.logger.debug({ owner, project, requestNumber }, 'closing pull request');
    await mustExist(this.client).client.pulls.update({
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

    const response = await mustExist(this.client).client.pulls.get({
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

    const response = await mustExist(this.client).client.pulls.list({
      owner,
      repo: project,
    });
    return this.transformJSON(cmd, response.data);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Update)
  @CheckRBAC()
  public async updateRequest(cmd: Command, ctx: Context): Promise<void> {
    const action = cmd.getHead('action');
    if (action === 'merge') {
      return this.mergeRequest(cmd, ctx);
    } else if (action === 'approve') {
      return this.approveRequest(cmd, ctx);
    } else {
      return this.errorReply(ctx, ErrorReplyType.Unknown, 'unknown');
    }
  }

  protected async mergeRequest(cmd: Command, ctx: Context): Promise<void> {
    const message = cmd.getHead('message');
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    this.logger.debug({ owner, project, requestNumber }, 'merging pull request');
    await mustExist(this.client).client.pulls.merge({
      /* eslint-disable camelcase */
      commit_message: message,
      commit_title: message,
      owner,
      pull_number: requestNumber,
      repo: project,
    });
    return this.reply(ctx, `merged pull request ${requestNumber}`);
  }

  protected async approveRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getNumber('number');

    this.logger.debug({ owner, project, requestNumber }, 'approving pull request');
    await mustExist(this.client).client.pulls.createReview({
      event: 'APPROVE',
      owner,
      pull_number: requestNumber,
      repo: project,
    });
    return this.reply(ctx, `approved pull request ${requestNumber}`);
  }
}

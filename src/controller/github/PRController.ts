import { defaults } from '@octokit/graphql';
import { isNil } from 'lodash';
import { Inject } from 'noicejs';

import { CheckRBAC, Handler } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { mustExist } from 'src/utils';

export const NOUN_PULL_REQUEST = 'github-pull-request';

export const QUERY_PR_CLOSE = `
  mutation merge ($requestID: ID!) {
    closePullRequest(input: {
      pullRequestId: $requestID
    }) {
      pullRequest {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

export const QUERY_PR_GET = `
  query ($owner: String!, $project: String!, $requestNumber: Int!) {
    repository(owner: $owner, name: $project) {
      pullRequest(number: $requestNumber) {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

export const QUERY_PR_LIST = `
  query ($owner: String!, $project: String!) {
    repository(owner: $owner, name: $project) {
      pullRequests(first: 10, states: [OPEN]) {
        nodes {
          author {
            login
          }
          id
          number
          title
        }
      }
    }
  }
`;

export const QUERY_PR_MERGE = `
  mutation merge ($requestID: ID!, $message: String!) {
    mergePullRequest(input: {
      commitBody: ""
      commitHeadline: $message
      pullRequestId: $requestID
    }) {
      pullRequest {
        author {
          login
        }
        id
        number
        title
      }
    }
  }
`;

interface GithubGetResponse {
  data: {
    repository: {
      pullRequest: {
        author: {
          login: string;
        };
        id: string;
        number: number;
        title: string;
      }
    }
  }
}

export interface GithubPRControllerData extends ControllerData {
  client: {
    root?: string;
    token: string;
  };
}

export type GithubPRControllerOptions = ControllerOptions<GithubPRControllerData>;

@Inject()
export class GithubPRController extends BaseController<GithubPRControllerData> implements Controller {
  protected client: Function;

  constructor(options: GithubPRControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-github-pr', [NOUN_PULL_REQUEST]);

    this.client = defaults({
      headers: {
        accept: 'application/vnd.github.ocelot-preview+json',
        authorization: `token ${options.data.client.token}`,
      },
    });
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteRequest(cmd: Command): Promise<void> {
    const ctx = mustExist(cmd.context);
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const requestData = await this.getRequestData(owner, project, requestNumber);
    if (isNil(requestData)) {
      return this.reply(ctx, 'pull request not found or already closed');
    }

    this.logger.debug({ requestData }, 'updating pull request');
    const requestID = requestData.data.repository.pullRequest.id;

    this.logger.debug({ owner, project, requestID, requestNumber }, 'closing pull request');
    await this.client(QUERY_PR_CLOSE, {
      requestID,
    });
    return this.reply(ctx, `closed pull request ${requestNumber}`);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Get)
  @CheckRBAC()
  public async getRequest(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const response = await this.getRequestData(owner, project, requestNumber);
    return this.transformJSON(cmd, [response.data.repository.pullRequest]);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.List)
  @CheckRBAC()
  public async listRequests(cmd: Command, ctx: Context): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');

    const response = await this.client(QUERY_PR_LIST, {
      owner,
      project,
    });
    return this.transformJSON(cmd, response.data.repository.pullRequests.nodes);
  }

  @Handler(NOUN_PULL_REQUEST, CommandVerb.Update)
  @CheckRBAC()
  public async updateRequest(cmd: Command, ctx: Context): Promise<void> {
    const message = cmd.getHead('message');
    const owner = cmd.getHeadOrDefault('owner', ctx.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const requestData = await this.getRequestData(owner, project, requestNumber);
    if (isNil(requestData)) {
      return this.reply(ctx, 'pull request not found or already closed');
    }

    this.logger.debug({ requestData }, 'updating pull request');
    const requestID = requestData.data.repository.pullRequest.id;

    this.logger.debug({ owner, project, requestID, requestNumber }, 'merging pull request');
    await this.client(QUERY_PR_MERGE, {
      message,
      requestID,
    });
    return this.reply(ctx, `merged pull request ${requestNumber}`);
  }

  protected async getRequestData(owner: string, project: string, requestNumber: string): Promise<GithubGetResponse> {
    const queryVars = {
      owner,
      project,
      requestNumber,
    };
    this.logger.debug({ queryVars }, 'query variables');

    return this.client(QUERY_PR_GET, queryVars);
  }
}

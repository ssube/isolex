import { defaults } from '@octokit/graphql';
import { isNil } from 'lodash';
import { Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';

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

  public async handle(cmd: Command): Promise<void> {
    if (cmd.noun !== NOUN_PULL_REQUEST) {
      return this.reply(cmd.context, 'invalid noun');
    }

    switch (cmd.verb) {
      case CommandVerb.Delete:
        return this.deleteRequest(cmd);
      case CommandVerb.Get:
        return this.getRequest(cmd);
      case CommandVerb.List:
        return this.listRequests(cmd);
      case CommandVerb.Update:
        return this.updateRequest(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async deleteRequest(cmd: Command): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', cmd.context.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const requestData = await this.getRequestData(owner, project, requestNumber);
    if (isNil(requestData)) {
      return this.reply(cmd.context, 'pull request not found or already closed');
    }

    this.logger.debug({ requestData }, 'updating pull request');
    const requestID = requestData.data.repository.pullRequest.id;

    this.logger.debug({ owner, project, requestID, requestNumber }, 'closing pull request');
    await this.client(QUERY_PR_CLOSE, {
      requestID,
    });
    return this.reply(cmd.context, `closed pull request ${requestNumber}`);
  }

  public async getRequest(cmd: Command): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', cmd.context.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const response = await this.getRequestData(owner, project, requestNumber);
    return this.transformJSON(cmd, [response.data.repository.pullRequest]);
  }

  public async listRequests(cmd: Command): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', cmd.context.name);
    const project = cmd.getHead('project');

    const response = await this.client(QUERY_PR_LIST, {
      owner,
      project,
    });
    return this.transformJSON(cmd, response.data.repository.pullRequests.nodes);
  }

  public async updateRequest(cmd: Command): Promise<void> {
    const message = cmd.getHead('message');
    const owner = cmd.getHeadOrDefault('owner', cmd.context.name);
    const project = cmd.getHead('project');
    const requestNumber = cmd.getHead('number');

    const requestData = await this.getRequestData(owner, project, requestNumber);
    if (isNil(requestData)) {
      return this.reply(cmd.context, 'pull request not found or already closed');
    }

    this.logger.debug({ requestData }, 'updating pull request');
    const requestID = requestData.data.repository.pullRequest.id;

    this.logger.debug({ owner, project, requestID, requestNumber }, 'merging pull request');
    await this.client(QUERY_PR_MERGE, {
      message,
      requestID,
    });
    return this.reply(cmd.context, `merged pull request ${requestNumber}`);
  }

  protected async getRequestData(owner: string, project: string, requestNumber: string): Promise<any> {
    const queryVars = {
      owner,
      project,
      requestNumber,
    };
    this.logger.debug({ queryVars }, 'query variables');

    return this.client(QUERY_PR_GET, queryVars);
  }
}

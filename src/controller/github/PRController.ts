import { defaults } from '@octokit/graphql';
import { Inject } from 'noicejs';

import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { TYPE_JSON } from 'src/utils/Mime';

import { BaseController } from '../BaseController';
import { Controller, ControllerData, ControllerOptions } from '../Controller';

export const NOUN_PULL_REQUEST = 'github-pull-request';

export const QUERY_PR_GET = `
  query ($owner: String!, $project: String!) {
    repository(owner: $owner, name: $project) {
      pullRequests(first: 10, states: [OPEN]) {
        nodes {
          author {
            login
          }
          number
          title
        }
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

@Inject('bot', 'services')
export class GithubPRController extends BaseController<GithubPRControllerData> implements Controller {
  protected client: Function;

  constructor(options: GithubPRControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-github-pr', [NOUN_PULL_REQUEST]);

    this.client = defaults({
      headers: {
        authorization: `token ${options.data.client.token}`,
      },
    });
  }

  public async handle(cmd: Command): Promise<void> {
    if (cmd.noun !== NOUN_PULL_REQUEST) {
      return this.reply(cmd.context, 'invalid noun');
    }

    switch (cmd.verb) {
      case CommandVerb.List:
        return this.listRequests(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async listRequests(cmd: Command): Promise<void> {
    const owner = cmd.getHeadOrDefault('owner', cmd.context.name);
    const project = cmd.getHead('project');

    const response = await this.client(QUERY_PR_GET, {
      owner,
      project,
    });

    this.logger.debug({ response }, 'response from github');

    const body = await this.transform(cmd, new Message({
      body: JSON.stringify(response.data.repository.pullRequests.nodes),
      context: cmd.context,
      reactions: [],
      type: TYPE_JSON,
    }));

    await this.bot.sendMessage(...body);
  }
}

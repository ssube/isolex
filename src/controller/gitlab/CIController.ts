import { Container, Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { GitlabClient, GitlabClientData } from 'src/utils/gitlab';
import { TYPE_JSON } from 'src/utils/Mime';

export interface GitlabCIControllerData extends ControllerData {
  client: GitlabClientData;
}

export type GitlabCIControllerOptions = ControllerOptions<GitlabCIControllerData>;

export const NOUN_GITLAB_JOB = 'gitlab-ci-job';
export const NOUN_GITLAB_PIPELINE = 'gitlab-ci-pipeline';

@Inject()
export class GitlabCIController extends BaseController<GitlabCIControllerData> implements Controller {
  protected client: GitlabClient;
  protected container: Container;

  constructor(options: GitlabCIControllerOptions) {
    super(options, 'isolex#/definitions/service-controller-gitlab-ci', [NOUN_GITLAB_JOB, NOUN_GITLAB_PIPELINE]);
    this.container = options.container;
  }

  public async start() {
    await super.start();

    this.client = await this.container.create(GitlabClient, {
      data: this.data.client,
      logger: this.logger,
    });
  }

  public async handle(cmd: Command): Promise<void> {
    switch (cmd.noun) {
      case NOUN_GITLAB_JOB:
        return this.handleJob(cmd);
      case NOUN_GITLAB_PIPELINE:
        return this.handlePipeline(cmd);
      default:
        return this.reply(cmd.context, 'unknown noun');
    }
  }

  public async handleJob(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.List:
        return this.listJobs(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async handlePipeline(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.List:
        return this.listPipelines(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async listJobs(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const pipeline = cmd.getHead('pipeline');
    const project = cmd.getHead('project');
    const jobs = await this.client.getJobs({
      group,
      pipeline,
      project,
    });
    return this.formatResponse(cmd, jobs);
  }

  public async listPipelines(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const project = cmd.getHead('project');
    const pipelines = await this.client.getPipelines({
      group,
      project,
    });
    return this.formatResponse(cmd, pipelines);
  }

  protected async formatResponse(cmd: Command, response: any): Promise<void> {
    this.logger.debug({ response }, 'response from gitlab');

    const body = await this.transform(cmd, new Message({
      body: JSON.stringify(response),
      context: cmd.context,
      reactions: [],
      type: TYPE_JSON,
    }));

    await this.bot.sendMessage(...body);
  }
}

import { Container, Inject } from 'noicejs';

import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { GitlabClient, GitlabClientData } from 'src/utils/gitlab';
import { TYPE_JSON } from 'src/utils/Mime';
import { isNil } from 'lodash';

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
      case CommandVerb.Delete:
        return this.deleteJob(cmd);
      case CommandVerb.Get:
        return this.getJob(cmd);
      case CommandVerb.List:
        return this.listJobs(cmd);
      case CommandVerb.Update:
        return this.updateJob(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async handlePipeline(cmd: Command): Promise<void> {
    switch (cmd.verb) {
      case CommandVerb.Create:
        return this.createPipeline(cmd);
      case CommandVerb.Delete:
        return this.deletePipeline(cmd);
      case CommandVerb.Get:
        return this.getPipeline(cmd);
      case CommandVerb.List:
        return this.listPipelines(cmd);
      case CommandVerb.Update:
        return this.updatePipeline(cmd);
      default:
        return this.reply(cmd.context, 'invalid verb');
    }
  }

  public async createPipeline(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const project = cmd.getHead('project');
    const ref = cmd.getHead('ref');
    const pipeline = await this.client.createPipeline({
      group,
      project,
      ref,
    });
    return this.transformJSON(cmd, pipeline);
  }

  public async deletePipeline(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const pipeline = cmd.getHead('pipeline');
    const project = cmd.getHead('project');

    const options = {
      group,
      pipeline,
      project,
    };
    const existing = await this.client.getPipeline(options);
    if (isNil(existing)) {
      return this.reply(cmd.context, 'pipeline does not exist');
    }

    const updated = await this.client.cancelPipeline(options);
    return this.transformJSON(cmd, updated);
  }

  public async deleteJob(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const job = cmd.getHead('job');
    const project = cmd.getHead('project');

    const options = {
      group,
      job,
      project,
    };
    const existing = await this.client.getJob(options);
    if (isNil(existing)) {
      return this.reply(cmd.context, 'job does not exist');
    }

    const updated = await this.client.cancelJob(options);
    return this.transformJSON(cmd, updated);
  }

  public async getJob(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const job = cmd.getHead('job');
    const project = cmd.getHead('project');
    const response = await this.client.getJob({
      group,
      job,
      project,
    });
    return this.transformJSON(cmd, response);
  }

  public async getPipeline(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const pipeline = cmd.getHead('pipeline');
    const project = cmd.getHead('project');
    const response = await this.client.getPipeline({
      group,
      pipeline,
      project,
    });
    return this.transformJSON(cmd, response);
  }

  public async listJobs(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const pipeline = cmd.getHead('pipeline');
    const project = cmd.getHead('project');
    const jobs = await this.client.listJobs({
      group,
      pipeline,
      project,
    });
    return this.transformJSON(cmd, jobs);
  }

  public async listPipelines(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const project = cmd.getHead('project');
    const pipelines = await this.client.listPipelines({
      group,
      project,
    });
    return this.transformJSON(cmd, pipelines);
  }

  public async updateJob(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const job = cmd.getHead('job');
    const project = cmd.getHead('project');

    const options = {
      group,
      job,
      project,
    };
    const existing = await this.client.getJob(options);
    if (!existing.length) {
      return this.reply(cmd.context, 'pipeline not found');
    }

    const retried = await this.client.retryJob(options);
    return this.transformJSON(cmd, retried);
  }

  public async updatePipeline(cmd: Command): Promise<void> {
    const group = cmd.getHead('group');
    const pipeline = cmd.getHead('pipeline');
    const project = cmd.getHead('project');
    
    const options = {
      group,
      pipeline,
      project,
    };
    const existing = await this.client.getPipeline(options);
    if (!existing.length) {
      return this.reply(cmd.context, 'pipeline not found');
    }

    const retried = await this.client.retryPipeline(options);
    return this.transformJSON(cmd, retried);
  }
}

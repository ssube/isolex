import { isNil } from 'lodash';
import { Container, Inject } from 'noicejs';

import { CheckRBAC, HandleNoun, HandleVerb } from 'src/controller';
import { BaseController } from 'src/controller/BaseController';
import { Controller, ControllerData, ControllerOptions } from 'src/controller/Controller';
import { Command, CommandVerb } from 'src/entity/Command';
import { GitlabClient, GitlabClientData, JobOptions, PipelineOptions, ProjectOptions } from 'src/utils/gitlab';

export interface GitlabCIControllerData extends ControllerData {
  client: GitlabClientData;
}

export type GitlabCIControllerOptions = ControllerOptions<GitlabCIControllerData>;

export const NOUN_GITLAB_JOB = 'gitlab-ci-job';
export const NOUN_GITLAB_PIPELINE = 'gitlab-ci-pipeline';

@Inject()
export class GitlabCIController extends BaseController<GitlabCIControllerData> implements Controller {
  protected client!: GitlabClient;
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

  @HandleNoun(NOUN_GITLAB_JOB)
  @HandleVerb(CommandVerb.Delete)
  @CheckRBAC()
  public async deleteJob(cmd: Command): Promise<void> {
    const options = this.getJobOptions(cmd);
    const existing = await this.client.getJob(options);
    if (isNil(existing)) {
      return this.reply(cmd.context, 'job does not exist');
    }

    const updated = await this.client.cancelJob(options);
    return this.transformJSON(cmd, [updated]);
  }

  @HandleNoun(NOUN_GITLAB_JOB)
  @HandleVerb(CommandVerb.Get)
  @CheckRBAC()
  public async getJob(cmd: Command): Promise<void> {
    const options = this.getJobOptions(cmd);
    const response = await this.client.getJob(options);
    return this.transformJSON(cmd, [response]);
  }

  @HandleNoun(NOUN_GITLAB_JOB)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listJobs(cmd: Command): Promise<void> {
    const options = this.getPipelineOptions(cmd);
    const jobs = await this.client.listJobs(options);
    return this.transformJSON(cmd, jobs);
  }

  @HandleNoun(NOUN_GITLAB_JOB)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
  public async updateJob(cmd: Command): Promise<void> {
    const options = this.getJobOptions(cmd);
    const existing = await this.client.getJob(options);
    if (!existing.length) {
      return this.reply(cmd.context, 'pipeline not found');
    }

    const retried = await this.client.retryJob(options);
    return this.transformJSON(cmd, [retried]);
  }

  @HandleNoun(NOUN_GITLAB_PIPELINE)
  @HandleVerb(CommandVerb.Create)
  @CheckRBAC()
  public async createPipeline(cmd: Command): Promise<void> {
    const options = {
      ...this.getProjectOptions(cmd),
      ref: cmd.getHead('ref'),
    };
    const pipeline = await this.client.createPipeline(options);
    return this.transformJSON(cmd, [pipeline]);
  }

  @HandleNoun(NOUN_GITLAB_PIPELINE)
  @HandleVerb(CommandVerb.Delete)
  @CheckRBAC()
  public async deletePipeline(cmd: Command): Promise<void> {
    const options = this.getPipelineOptions(cmd);
    const existing = await this.client.getPipeline(options);
    if (isNil(existing)) {
      return this.reply(cmd.context, 'pipeline does not exist');
    }

    const updated = await this.client.cancelPipeline(options);
    return this.transformJSON(cmd, [updated]);
  }

  @HandleNoun(NOUN_GITLAB_PIPELINE)
  @HandleVerb(CommandVerb.Get)
  @CheckRBAC()
  public async getPipeline(cmd: Command): Promise<void> {
    const options = this.getPipelineOptions(cmd);
    const response = await this.client.getPipeline(options);
    return this.transformJSON(cmd, [response]);
  }

  @HandleNoun(NOUN_GITLAB_PIPELINE)
  @HandleVerb(CommandVerb.List)
  @CheckRBAC()
  public async listPipelines(cmd: Command): Promise<void> {
    const options = this.getProjectOptions(cmd);
    const pipelines = await this.client.listPipelines(options);
    return this.transformJSON(cmd, pipelines);
  }

  @HandleNoun(NOUN_GITLAB_PIPELINE)
  @HandleVerb(CommandVerb.Update)
  @CheckRBAC()
  public async updatePipeline(cmd: Command): Promise<void> {
    const options = this.getPipelineOptions(cmd);
    const existing = await this.client.getPipeline(options);
    if (!existing.length) {
      return this.reply(cmd.context, 'pipeline not found');
    }

    const retried = await this.client.retryPipeline(options);
    return this.transformJSON(cmd, [retried]);
  }

  protected getProjectOptions(cmd: Command): ProjectOptions {
    const group = cmd.getHead('group');
    const project = cmd.getHead('project');
    return {
      group,
      project,
    };
  }

  protected getJobOptions(cmd: Command): JobOptions {
    const job = cmd.getHead('job');
    return {
      ...this.getProjectOptions(cmd),
      job,
    };
  }

  protected getPipelineOptions(cmd: Command): PipelineOptions {
    const pipeline = cmd.getHead('pipeline');
    return {
      ...this.getProjectOptions(cmd),
      pipeline,
    };
  }
}

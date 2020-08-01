import { isNil, mustExist } from '@apextoaster/js-utils';
import { Container, Inject } from 'noicejs';

import { CheckRBAC, Controller, ControllerData, Handler } from '..';
import { Command, CommandVerb } from '../../entity/Command';
import { Context } from '../../entity/Context';
import { GitlabClient, GitlabClientData, JobOptions, PipelineOptions, ProjectOptions } from '../../utils/gitlab';
import { BaseController, BaseControllerOptions } from '../BaseController';

export interface GitlabCIControllerData extends ControllerData {
  client: GitlabClientData;
}

export const NOUN_GITLAB_JOB = 'gitlab-ci-job';
export const NOUN_GITLAB_PIPELINE = 'gitlab-ci-pipeline';

@Inject()
export class GitlabCIController extends BaseController<GitlabCIControllerData> implements Controller {
  protected readonly container: Container;
  protected client?: GitlabClient;

  constructor(options: BaseControllerOptions<GitlabCIControllerData>) {
    super(options, 'isolex#/definitions/service-controller-gitlab-ci', [NOUN_GITLAB_JOB, NOUN_GITLAB_PIPELINE]);
    this.container = options.container;
  }

  public async start() {
    await super.start();

    this.client = await this.container.create(GitlabClient, {
      data: this.data.client,
    });
  }

  @Handler(NOUN_GITLAB_JOB, CommandVerb.Delete)
  @CheckRBAC()
  public async deleteJob(cmd: Command, ctx: Context): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getJobOptions(cmd);
    const existing = await client.getJob(options);
    if (isNil(existing)) {
      return this.reply(ctx, 'job does not exist');
    }

    const updated = await client.cancelJob(options);
    return this.transformJSON(cmd, [updated]);
  }

  @Handler(NOUN_GITLAB_JOB, CommandVerb.Get)
  @CheckRBAC()
  public async getJob(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getJobOptions(cmd);
    const response = await client.getJob(options);
    return this.transformJSON(cmd, [response]);
  }

  @Handler(NOUN_GITLAB_JOB, CommandVerb.List)
  @CheckRBAC()
  public async listJobs(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getPipelineOptions(cmd);
    const jobs = await client.listJobs(options);
    return this.transformJSON(cmd, jobs);
  }

  @Handler(NOUN_GITLAB_JOB, CommandVerb.Update)
  @CheckRBAC()
  public async updateJob(cmd: Command, ctx: Context): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getJobOptions(cmd);
    const existing = await client.getJob(options);
    if (existing.length === 0) {
      return this.reply(ctx, 'pipeline not found');
    }

    const retried = await client.retryJob(options);
    return this.transformJSON(cmd, [retried]);
  }

  @Handler(NOUN_GITLAB_PIPELINE, CommandVerb.Create)
  @CheckRBAC()
  public async createPipeline(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const options = {
      ...this.getProjectOptions(cmd),
      ref: cmd.getHead('ref'),
    };
    const pipeline = await client.createPipeline(options);
    return this.transformJSON(cmd, [pipeline]);
  }

  @Handler(NOUN_GITLAB_PIPELINE, CommandVerb.Delete)
  @CheckRBAC()
  public async deletePipeline(cmd: Command, ctx: Context): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getPipelineOptions(cmd);
    const existing = await client.getPipeline(options);
    if (isNil(existing)) {
      return this.reply(ctx, 'pipeline does not exist');
    }

    const updated = await client.cancelPipeline(options);
    return this.transformJSON(cmd, [updated]);
  }

  @Handler(NOUN_GITLAB_PIPELINE, CommandVerb.Get)
  @CheckRBAC()
  public async getPipeline(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getPipelineOptions(cmd);
    const response = await client.getPipeline(options);
    return this.transformJSON(cmd, [response]);
  }

  @Handler(NOUN_GITLAB_PIPELINE, CommandVerb.List)
  @CheckRBAC()
  public async listPipelines(cmd: Command): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getProjectOptions(cmd);
    const pipelines = await client.listPipelines(options);
    return this.transformJSON(cmd, pipelines);
  }

  @Handler(NOUN_GITLAB_PIPELINE, CommandVerb.Update)
  @CheckRBAC()
  public async updatePipeline(cmd: Command, ctx: Context): Promise<void> {
    const client = mustExist(this.client);
    const options = this.getPipelineOptions(cmd);
    const existing = await client.getPipeline(options);
    if (existing.length === 0) {
      return this.reply(ctx, 'pipeline not found');
    }

    const retried = await client.retryPipeline(options);
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

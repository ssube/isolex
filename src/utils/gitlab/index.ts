import { isNil, kebabCase } from 'lodash';
import { BaseError, Container, Inject, Logger } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';

import { RequestFactory, RequestOptions } from 'src/utils/Request';

export interface ProjectOptions {
  group: string;
  project: string;
}

export interface ReferenceOptions extends ProjectOptions {
  ref: string;
}

export interface PipelineOptions extends ProjectOptions {
  pipeline: string;
}

export interface JobOptions extends ProjectOptions {
  job: string;
}

export interface GitlabClientData {
  root: string;
  token: string;
}

export interface GitlabClientOptions extends BaseOptions {
  data: GitlabClientData;
  logger: Logger;
}

// TODO: replace these with response types
/* tslint:disable:no-any */
export type JobResults = any;
export type PipelineResults = any;
export type ProjectResults = any;
/* tslint:enable:no-any */

@Inject()
export class GitlabClient {
  protected readonly container: Container;
  protected readonly logger: Logger;
  protected readonly data: GitlabClientData;

  constructor(options: GitlabClientOptions) {
    this.container = options.container;
    this.data = options.data;
    this.logger = options.logger.child({
      kind: kebabCase(GitlabClient.name),
    });
  }

  public async cancelJob(options: JobOptions): Promise<JobResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<JobResults>(`${projectURL}/jobs/${options.job}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async cancelPipeline(options: PipelineOptions): Promise<PipelineResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<PipelineResults>(`${projectURL}/pipelines/${options.pipeline}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async createPipeline(options: ReferenceOptions): Promise<PipelineResults> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = {
      ...this.getRequestOptions(options, 'POST'),
      qs: {
        ref: options.ref,
      },
    };
    return this.makeRequest<PipelineResults>(`${projectURL}/pipeline`, reqOptions);
  }

  public async getJob(options: JobOptions): Promise<JobResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<JobResults>(`${projectURL}/jobs/${options.job}`, this.getRequestOptions(options));
  }

  public async getPipeline(options: PipelineOptions): Promise<PipelineResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<PipelineResults>(`${projectURL}/pipelines/${options.pipeline}`, this.getRequestOptions(options));
  }

  public async getProject(options: ProjectOptions): Promise<ProjectResults> {
    return this.makeRequest<ProjectResults>(this.getProjectURL(options), this.getRequestOptions(options));
  }

  public async listJobs(options: PipelineOptions): Promise<Array<JobResults>> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = this.getRequestOptions(options);
    if (isNil(options.pipeline)) {
      return this.makeRequest<Array<JobResults>>(`${projectURL}/jobs`, reqOptions);
    } else {
      return this.makeRequest<Array<JobResults>>(`${projectURL}/pipelines/${options.pipeline}/jobs`, reqOptions);
    }
  }

  public async listPipelines(options: ProjectOptions): Promise<Array<PipelineResults>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<PipelineResults>>(`${projectURL}/pipelines`, this.getRequestOptions(options));
  }

  public async retryJob(options: JobOptions): Promise<JobResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<JobResults>(`${projectURL}/jobs/${options.job}/retry`, this.getRequestOptions(options, 'POST'));
  }

  public async retryPipeline(options: PipelineOptions): Promise<PipelineResults> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<PipelineResults>(`${projectURL}/pipelines/${options.pipeline}/retry`, this.getRequestOptions(options, 'POST'));
  }

  protected getProjectURL(options: ProjectOptions): string {
    const projectPath = encodeURIComponent(`${options.group}/${options.project}`);
    return this.getRequestUrl(`projects/${projectPath}`);
  }

  protected getRequestOptions<TOptions extends ProjectOptions>(options: TOptions, method = 'GET'): Partial<RequestOptions> {
    return {
      headers: {
        'Private-Token': this.data.token,
      },
      method,
    };
  }

  protected getRequestUrl(path: string): string {
    return `${this.data.root}/api/v4/${path}`;
  }

  protected async makeRequest<T>(url: string, options: Partial<RequestOptions>): Promise<T> {
    try {
      const request = await this.container.create<RequestFactory, unknown>('request');
      const response = await request.create<string>({
        url,
        ...options,
      });
      this.logger.debug({ response }, 'got response from gitlab');
      return JSON.parse(response);
    } catch (err) {
      this.logger.error({ err }, 'error making gitlab request');
      throw new BaseError('error making gitlab request');
    }
  }
}

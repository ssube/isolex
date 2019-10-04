import { isNil } from 'lodash';
import { BaseError, BaseOptions, Container, Inject, Logger } from 'noicejs';

import { mustExist } from '..';
import { INJECT_LOGGER, INJECT_REQUEST } from '../../BaseService';
import { classLogger } from '../logger';
import { RequestFactory, RequestOptions } from '../Request';

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
  [INJECT_LOGGER]?: Logger;
  [INJECT_REQUEST]?: RequestFactory;
  data: GitlabClientData;
}

export interface JobResult {
  created_at: string;
  started_at: string;
  finished_at: string;
  duration: number;
  id: number;
  name: string;
  pipeline: {
    id: number;
    ref: string;
    sha: string;
    status: string;
  };
  ref: string;
  runner: string;
  stage: string;
  status: string;
}

export interface PipelineResult {
  id: number;
  status: string;
  ref: string;
  sha: string;
  web_url: string;
}

export interface ProjectResult {
  id: number;
  description: string;
  default_branch: string;
  name: string;
  path: string;
  created_at: string;
  last_activity_at: string;
}

@Inject(INJECT_LOGGER, INJECT_REQUEST)
export class GitlabClient {
  protected readonly logger: Logger;
  protected readonly data: GitlabClientData;
  protected readonly request: RequestFactory;

  constructor(options: GitlabClientOptions) {
    this.data = options.data;
    this.logger = classLogger(mustExist(options[INJECT_LOGGER]), GitlabClient);
    this.request = mustExist(options[INJECT_REQUEST]);
  }

  public async cancelJob(options: JobOptions): Promise<Array<JobResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<JobResult>>(`${projectURL}/jobs/${options.job}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async cancelPipeline(options: PipelineOptions): Promise<Array<PipelineResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<PipelineResult>>(`${projectURL}/pipelines/${options.pipeline}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async createPipeline(options: ReferenceOptions): Promise<Array<PipelineResult>> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = {
      ...this.getRequestOptions(options, 'POST'),
      qs: {
        ref: options.ref,
      },
    };
    return this.makeRequest<Array<PipelineResult>>(`${projectURL}/pipeline`, reqOptions);
  }

  public async getJob(options: JobOptions): Promise<Array<JobResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<JobResult>>(`${projectURL}/jobs/${options.job}`, this.getRequestOptions(options));
  }

  public async getPipeline(options: PipelineOptions): Promise<Array<PipelineResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<PipelineResult>>(`${projectURL}/pipelines/${options.pipeline}`, this.getRequestOptions(options));
  }

  public async getProject(options: ProjectOptions): Promise<Array<ProjectResult>> {
    return this.makeRequest<Array<ProjectResult>>(this.getProjectURL(options), this.getRequestOptions(options));
  }

  public async listJobs(options: PipelineOptions): Promise<Array<Array<JobResult>>> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = this.getRequestOptions(options);
    if (isNil(options.pipeline)) {
      return this.makeRequest<Array<Array<JobResult>>>(`${projectURL}/jobs`, reqOptions);
    } else {
      return this.makeRequest<Array<Array<JobResult>>>(`${projectURL}/pipelines/${options.pipeline}/jobs`, reqOptions);
    }
  }

  public async listPipelines(options: ProjectOptions): Promise<Array<Array<PipelineResult>>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<Array<PipelineResult>>>(`${projectURL}/pipelines`, this.getRequestOptions(options));
  }

  public async retryJob(options: JobOptions): Promise<Array<JobResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<JobResult>>(`${projectURL}/jobs/${options.job}/retry`, this.getRequestOptions(options, 'POST'));
  }

  public async retryPipeline(options: PipelineOptions): Promise<Array<PipelineResult>> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest<Array<PipelineResult>>(`${projectURL}/pipelines/${options.pipeline}/retry`, this.getRequestOptions(options, 'POST'));
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

  protected async makeRequest<T>(url: string, extraOptions: Partial<RequestOptions>): Promise<T> {
    try {
      const options: RequestOptions = {
        ...extraOptions,
        uri: url,
        url,
      };
      const response = await this.request.create<string>(options);
      this.logger.debug({ response }, 'got response from gitlab');
      return JSON.parse(response);
    } catch (err) {
      this.logger.error({ err }, 'error making gitlab request');
      throw new BaseError('error making gitlab request');
    }
  }
}

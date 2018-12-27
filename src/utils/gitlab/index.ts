import { isNil, kebabCase } from 'lodash';
import { Container, Inject, Logger } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';

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

  public async cancelJob(options: JobOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/jobs/${options.job}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async cancelPipeline(options: PipelineOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/pipelines/${options.pipeline}/cancel`, this.getRequestOptions(options, 'POST'));
  }

  public async createPipeline(options: ReferenceOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = {
      ...this.getRequestOptions(options, 'POST'),
      qs: {
        ref: options.ref,
      },
    };
    return this.makeRequest(`${projectURL}/pipeline`, reqOptions);
  }

  public async getJob(options: JobOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/jobs/${options.job}`, options);
  }

  public async getPipeline(options: PipelineOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/pipelines/${options.pipeline}`, options);
  }

  public async getProject(options: ProjectOptions): Promise<any> {
    return this.makeRequest(this.getProjectURL(options), options);
  }

  public async listJobs(options: PipelineOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    const reqOptions = this.getRequestOptions(options);
    if (isNil(options.pipeline)) {
      return this.makeRequest(`${projectURL}/jobs`, reqOptions);
    } else {
      return this.makeRequest(`${projectURL}/pipelines/${options.pipeline}/jobs`, reqOptions);
    }
  }

  public async listPipelines(options: ProjectOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/pipelines`, this.getRequestOptions(options));
  }

  public async retryJob(options: JobOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/jobs/${options.job}/retry`, this.getRequestOptions(options, 'POST'));
  }

  public async retryPipeline(options: PipelineOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/pipelines/${options.pipeline}/retry`, this.getRequestOptions(options, 'POST'));
  }

  protected getProjectURL(options: ProjectOptions): any {
    const projectPath = encodeURIComponent(`${options.group}/${options.project}`);
    return this.getRequestUrl(`projects/${projectPath}`);
  }

  protected getRequestOptions<TOptions extends ProjectOptions>(options: TOptions, method = 'GET'): any {
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

  protected async makeRequest(url: string, options: ProjectOptions): Promise<any> {
    try {
      const response = await this.container.create<string, any>('request', {
        url,
        ...options,
      });
      this.logger.debug({ response }, 'got response from gitlab');
      return JSON.parse(response);
    } catch (err) {
      this.logger.error(err, 'error during gitlab request');
      return [];
    }
  }
}

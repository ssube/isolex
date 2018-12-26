import { kebabCase } from 'lodash';
import { Container, Inject, Logger } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';

export interface ProjectOptions {
  group: string;
  project: string;
}

export interface PipelineOptions extends ProjectOptions {
  pipeline: string;
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

  public async getJobs(options: PipelineOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/jobs`, this.getRequestOptions(options));
  }

  public async getPipelines(options: ProjectOptions): Promise<any> {
    const projectURL = this.getProjectURL(options);
    return this.makeRequest(`${projectURL}/pipelines`, this.getRequestOptions(options));
  }

  public async getProject(options: ProjectOptions): Promise<any> {
    return this.makeRequest(this.getProjectURL(options), options);
  }

  protected getProjectURL(options: ProjectOptions): any {
    const projectPath = encodeURIComponent(`${options.group}/${options.project}`);
    return this.getRequestUrl(`projects/${projectPath}`);
  }

  protected getRequestOptions<TOptions extends ProjectOptions>(options: TOptions): any {
    return {
      headers: {
        'Private-Token': this.data.token,
      },
    };
  }

  protected getRequestUrl(path: string): string {
    return `${this.data.root}/api/v4/${path}`;
  }

  protected async makeRequest(url: string, options: ProjectOptions): Promise<any> {
    const response = await this.container.create<string, any>('request', {
      url,
      ...options,
    });
    this.logger.debug({ response }, 'got response from gitlab');
    return JSON.parse(response);
  }
}

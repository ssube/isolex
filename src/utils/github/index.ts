import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { INJECT_LOGGER } from '../../BaseService';

export interface GithubClientData {
  agent: string;
  app: {
    id: number;
    key: string;
  };
  installation: {
    id: number;
  };
  root?: string;
}

export interface GithubClientOptions extends BaseOptions {
  [INJECT_LOGGER]: Logger;
  app: typeof App;
  data: GithubClientData;
  kit: typeof Octokit;
}

@Inject(INJECT_LOGGER)
export class GithubClient {
  public readonly client: Octokit;
  protected readonly app: App;
  protected readonly data: GithubClientData;

  constructor(options: GithubClientOptions) {
    const {
      app = App,
      data,
      kit = Octokit,
    } = options;

    this.app = new app({
      id: options.data.app.id,
      privateKey: options.data.app.key,
    });
    this.client = new kit({
      auth: () => this.renewToken(),
      previews: [
        'application/vnd.github.machine-man-preview+json',
        'application/vnd.github.ocelot-preview+json',
      ],
      userAgent: options.data.agent,
    });
    this.data = data;
  }

  public async renewToken() {
    const token = await this.app.getInstallationAccessToken({
      installationId: this.data.installation.id,
    });
    return `token ${token}`;
  }
}

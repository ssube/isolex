import { App } from '@octokit/app';
import Octokit from '@octokit/rest';
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
  data: GithubClientData;
}

@Inject(INJECT_LOGGER)
export class GithubClient {
  public readonly client: Octokit;
  protected app: App;

  constructor(options: GithubClientOptions) {

    this.app = new App({
      id: options.data.app.id,
      privateKey: options.data.app.key,
    });

    this.client = new Octokit({
      auth: async () => {
        const token = await this.app.getInstallationAccessToken({
          installationId: options.data.installation.id,
        });
        return `token ${token}`;
      },
      previews: [
        'application/vnd.github.machine-man-preview+json',
        'application/vnd.github.ocelot-preview+json',
      ],
      userAgent: options.data.agent,
    });
  }
}

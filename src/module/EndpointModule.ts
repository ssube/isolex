import { ModuleOptions } from 'noicejs';

import { DebugEndpoint } from '../endpoint/DebugEndpoint';
import { EchoEndpoint } from '../endpoint/EchoEndpoint';
import { GithubEndpoint } from '../endpoint/GithubEndpoint';
import { GitlabEndpoint } from '../endpoint/GitlabEndpoint';
import { HealthEndpoint } from '../endpoint/HealthEndpoint';
import { BaseModule } from '../module/BaseModule';

export class EndpointModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // endpoints
    this.bindService(DebugEndpoint);
    this.bindService(EchoEndpoint);
    this.bindService(GithubEndpoint);
    this.bindService(GitlabEndpoint);
    this.bindService(HealthEndpoint);
  }
}

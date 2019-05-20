import { ModuleOptions } from 'noicejs';

import { EchoEndpoint } from 'src/endpoint/EchoEndpoint';
import { BaseModule } from 'src/module/BaseModule';

export class EndpointModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // endpoints
    this.bindService(EchoEndpoint);
  }
}


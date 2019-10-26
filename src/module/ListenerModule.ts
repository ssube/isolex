import { ModuleOptions } from 'noicejs';

import { DiscordListener } from '../listener/DiscordListener';
import { ExpressListener } from '../listener/ExpressListener';
import { GithubListener } from '../listener/GithubListener';
import { LoopbackListener } from '../listener/LoopbackListener';
import { SlackListener } from '../listener/SlackListener';
import { BaseModule } from './BaseModule';

export class ListenerModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // listeners
    this.bindService(DiscordListener);
    this.bindService(ExpressListener);
    this.bindService(GithubListener);
    this.bindService(LoopbackListener);
    this.bindService(SlackListener);
  }
}

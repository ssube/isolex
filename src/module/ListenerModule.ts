import { ModuleOptions } from 'noicejs';

import { DiscordListener } from 'src/listener/DiscordListener';
import { ExpressListener } from 'src/listener/ExpressListener';
import { SlackListener } from 'src/listener/SlackListener';
import { BaseModule } from 'src/module/BaseModule';

export class ListenerModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // listeners
    this.bindService(DiscordListener);
    this.bindService(ExpressListener);
    this.bindService(SlackListener);
  }
}

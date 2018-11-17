import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { DiscordListener } from 'src/listener/DiscordListener';

export class ListenerModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // listeners
    this.bind(kebabCase(DiscordListener.name)).toConstructor(DiscordListener);
  }
}

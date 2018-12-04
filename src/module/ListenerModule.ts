import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { DiscordListener } from 'src/listener/DiscordListener';
import { SlackListener } from 'src/listener/SlackListener';
import { ApolloListener } from 'src/listener/ApolloListener';

export class ListenerModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // listeners
    this.bind(kebabCase(ApolloListener.name)).toConstructor(ApolloListener);
    this.bind(kebabCase(DiscordListener.name)).toConstructor(DiscordListener);
    this.bind(kebabCase(SlackListener.name)).toConstructor(SlackListener);
  }
}

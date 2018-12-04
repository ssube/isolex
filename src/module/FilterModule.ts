import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { CommandFilter } from 'src/filter/CommandFilter';
import { MessageFilter } from 'src/filter/MessageFilter';
import { UserFilter } from 'src/filter/UserFilter';

export class FilterModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // filters
    this.bind(kebabCase(CommandFilter.name)).toConstructor(CommandFilter);
    this.bind(kebabCase(MessageFilter.name)).toConstructor(MessageFilter);
    this.bind(kebabCase(UserFilter.name)).toConstructor(UserFilter);
  }
}

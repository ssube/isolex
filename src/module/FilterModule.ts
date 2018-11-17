import { kebabCase } from 'lodash';
import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { UserFilter } from 'src/filter/UserFilter';

export class FilterModule extends Module {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // filters
    this.bind(kebabCase(UserFilter.name)).toConstructor(UserFilter);
  }
}

import { ModuleOptions } from 'noicejs';

import { CommandFilter } from 'src/filter/CommandFilter';
import { MessageFilter } from 'src/filter/MessageFilter';
import { UserFilter } from 'src/filter/UserFilter';
import { BaseModule } from 'src/module/BaseModule';

export class FilterModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // filters
    this.bindService(CommandFilter);
    this.bindService(MessageFilter);
    this.bindService(UserFilter);
  }
}

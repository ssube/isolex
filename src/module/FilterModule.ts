import { ModuleOptions } from 'noicejs';

import { CommandFilter } from '../filter/CommandFilter';
import { MessageFilter } from '../filter/MessageFilter';
import { UserFilter } from '../filter/UserFilter';
import { BaseModule } from '../module/BaseModule';

export class FilterModule extends BaseModule {
  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // filters
    this.bindService(CommandFilter);
    this.bindService(MessageFilter);
    this.bindService(UserFilter);
  }
}

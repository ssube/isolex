import { Module } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { InitialSetup0001526853117 } from 'src/migration/0001526853117-InitialSetup';
import { AddCounter0001527939908 } from 'src/migration/0001527939908-AddCounter';
import { CounterRoom0001529018132 } from 'src/migration/0001529018132-CounterRoom';
import { MessageType0001542414714 } from 'src/migration/0001542414714-MessageType';
import { AddAuth0001543704185 } from 'src/migration/0001543704185-AddAuth';
import { AddFragment0001543794891 } from 'src/migration/0001543794891-AddFragment';

export class MigrationModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind('migrations').toInstance([
      InitialSetup0001526853117,
      AddCounter0001527939908,
      CounterRoom0001529018132,
      MessageType0001542414714,
      AddAuth0001543704185,
      AddFragment0001543794891,
    ]);
  }
}

import { Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';

import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Counter } from 'src/entity/Counter';
import { Message } from 'src/entity/Message';
import { Trigger } from 'src/entity/Trigger';

import { InitialSetup0001526853117 } from 'src/entity/migration/0001526853117-InitialSetup';
import { AddCounter0001527939908 } from 'src/entity/migration/0001527939908-AddCounter';

export class MigrationModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind('migrations').toInstance([
      InitialSetup0001526853117,
      AddCounter0001527939908,
    ]);
  }

  @Provides('entities')
  protected async createEntities(): Promise<Array<Function>> {
    return [Command, Context, Counter, Message, Trigger];
  }
}

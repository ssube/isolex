import { Module, ModuleOptions, Provides } from 'noicejs';

import { Role } from 'src/entity/auth/Role';
import { Token } from 'src/entity/auth/Token';
import { User } from 'src/entity/auth/User';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { Counter } from 'src/entity/misc/Counter';
import { Keyword } from 'src/entity/misc/Keyword';
import { Tick } from 'src/entity/Tick';

export class EntityModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);
  }

  @Provides('entities')
  protected async createEntities(): Promise<Array<Function>> {
    return [
      Command,
      Context,
      Fragment,
      Message,
      Tick,
      /* auth */
      Role,
      Token,
      User,
      /* misc */
      Counter,
      Keyword,
    ];
  }
}

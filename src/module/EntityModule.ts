import { Module, ModuleOptions, Provides } from 'noicejs';

import { Role } from '../entity/auth/Role';
import { Token } from '../entity/auth/Token';
import { User } from '../entity/auth/User';
import { Command } from '../entity/Command';
import { Context } from '../entity/Context';
import { Fragment } from '../entity/Fragment';
import { Message } from '../entity/Message';
import { Counter } from '../entity/misc/Counter';
import { Keyword } from '../entity/misc/Keyword';
import { Tick } from '../entity/Tick';

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

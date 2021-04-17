import { Module, ModuleOptions } from 'noicejs';

import { CreateContext0001544311178 } from '../migration/0001544311178-CreateContext';
import { CreateCommand0001544311565 } from '../migration/0001544311565-CreateCommand';
import { CreateMessage0001544311687 } from '../migration/0001544311687-CreateMessage';
import { CreateKeyword0001544311784 } from '../migration/0001544311784-CreateKeyword';
import { CreateCounter0001544311799 } from '../migration/0001544311799-CreateCounter';
import { CreateFragment0001544311954 } from '../migration/0001544311954-CreateFragment';
import { CreateRole0001544312069 } from '../migration/0001544312069-CreateRole';
import { CreateUser0001544312112 } from '../migration/0001544312112-CreateUser';
import { CreateToken0001544317462 } from '../migration/0001544317462-CreateToken';
import { KeywordCommand0001545509108 } from '../migration/0001545509108-KeywordCommand';
import { CreateTick0001546063195 } from '../migration/0001546063195-CreateTick';
import { Dates0001546236755 } from '../migration/0001546236755-Dates';
import { FragmentUser0001546283532 } from '../migration/0001546283532-FragmentUser';
import { UserLocale0001548049058 } from '../migration/0001548049058-UserLocale';
import { ContextUser0001618702349 } from '../migration/0001618702349-ContextUser';

export const INJECT_MIGRATIONS = Symbol('inject-migrations');

export class MigrationModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_MIGRATIONS).toInstance([
      CreateContext0001544311178,
      CreateCommand0001544311565,
      CreateMessage0001544311687,
      CreateKeyword0001544311784,
      CreateCounter0001544311799,
      CreateFragment0001544311954,
      CreateRole0001544312069,
      CreateUser0001544312112,
      CreateToken0001544317462,
      KeywordCommand0001545509108,
      CreateTick0001546063195,
      Dates0001546236755,
      FragmentUser0001546283532,
      UserLocale0001548049058,
      ContextUser0001618702349,
    ]);
  }
}

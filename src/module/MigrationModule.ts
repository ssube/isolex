import { Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import { InitialSetup0001526853117 } from 'src/entity/migration/001526853117-InitialSetup';

export class MigrationModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind('migrations').toInstance([
      InitialSetup0001526853117,
    ]);
  }
}

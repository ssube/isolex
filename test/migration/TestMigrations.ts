import { INJECT_SCHEMA } from '../../src/BaseService';
import { EntityModule } from '../../src/module/EntityModule';
import { MigrationModule } from '../../src/module/MigrationModule';
import { ServiceModule } from '../../src/module/ServiceModule';
import { Schema } from '../../src/schema';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

describeLeaks('database migrations', async () => {
  xit('should run up', async () => {
    const modules = [
      new EntityModule(),
      new MigrationModule(),
      new ServiceModule({
        timeout: 50,
      }),
    ];
    const { container, module } = await createContainer(...modules);
    module.bind(INJECT_SCHEMA).toInstance(new Schema());

    const storage = await container.create(Storage, {
      data: {
        migrate: true,
        orm: {
          database: 'out/test-migration.db',
          type: 'sqlite',
        },
      },
      metadata: {
        kind: 'storage',
        name: 'test-storage',
      },
    });
    await storage.start();
  });

  itLeaks('should run down');
});

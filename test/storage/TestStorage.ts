import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { EntityModule } from '../../src/module/EntityModule';
import { MigrationModule } from '../../src/module/MigrationModule';
import { Storage } from '../../src/storage';
import { createServiceContainer } from '../helpers/container';

const TEST_METADATA = {
  kind: 'test-storage',
  name: 'test-storage',
};

describe('storage service', async () => {
  xit('should handle connection errors');

  it('should close connections when stopped', async () => {
    const { container } = await createServiceContainer(new EntityModule(), new MigrationModule());
    const storage = await container.create(Storage, {
      data: {
        migrate: false,
        orm: {
          database: './out/test.db',
          type: 'sqlite',
        },
      },
      metadata: TEST_METADATA,
    });
    await storage.start();
    await storage.stop();
    expect(storage.isConnected).to.equal(false);
  });

  it('should check connection status', async () => {
    const { container } = await createServiceContainer(new EntityModule(), new MigrationModule());
    const storage = await container.create(Storage, {
      data: {
        migrate: false,
        orm: {
          database: './out/test.db',
          type: 'sqlite',
        },
      },
      metadata: TEST_METADATA,
    });
    await storage.start();
    const connected = storage.isConnected;
    await storage.stop();
    expect(connected).to.equal(true);
  });
});

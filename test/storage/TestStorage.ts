import { expect } from 'chai';
import { BaseError } from 'noicejs';
import { stub } from 'sinon';

import { EntityModule } from '../../src/module/EntityModule';
import { MigrationModule } from '../../src/module/MigrationModule';
import { ServiceModule } from '../../src/module/ServiceModule';
import { Storage, StorageData } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer, createTestOptions } from '../helpers/container';

const TEST_METADATA = {
  kind: 'test-storage',
  name: 'test-storage',
};

const TEST_DATA: StorageData = {
  migrate: false,
  orm: {
    database: 'test.db',
    type: 'sqlite',
  },
};

describeLeaks('storage adapter', async () => {
  itLeaks('should handle connection errors', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }), new EntityModule(), new MigrationModule());
    const storage = await container.create(Storage, {
      ...createTestOptions(),
      connect: stub().throws(new BaseError('something went wrong!')),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    return expect(storage.start())
      .to.eventually.be.rejectedWith(BaseError, 'error connecting to storage');
  });

  itLeaks('should proxy connection status', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }), new EntityModule(), new MigrationModule());

    const connection = {
      isConnected: false,
      runMigrations: stub().returns(Promise.resolve()),
    };
    const isConnected = stub().returns(true);
    stub(connection, 'isConnected').get(isConnected);

    const storage = await container.create(Storage, {
      ...createTestOptions(),
      connect: stub().returns(connection),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    await storage.start();
    const connected = storage.isConnected;

    expect(connected).to.equal(true);
    expect(isConnected).to.have.callCount(1);
  });

  it('should report unconnected before starting', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }), new EntityModule(), new MigrationModule());
    const storage = await container.create(Storage, {
      ...createTestOptions(),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    expect(storage.isConnected).to.equal(false);
  });
});

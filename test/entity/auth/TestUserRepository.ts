import { getTestLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { User } from '../../../src/entity/auth/User';
import { UserRepository } from '../../../src/entity/auth/UserRepository';
import { BotModule } from '../../../src/module/BotModule';
import { EntityModule } from '../../../src/module/EntityModule';
import { MigrationModule } from '../../../src/module/MigrationModule';
import { Storage } from '../../../src/storage';
import { createServiceContainer } from '../../helpers/container';

describe('user repository', async () => {
  it('should populate roles', async () => {
    const { container } = await createServiceContainer(new BotModule({
      logger: getTestLogger(),
    }), new EntityModule(), new MigrationModule());
    const storage = await container.create(Storage, {
      data: {
        migrate: true,
        orm: {
          database: './out/test.db',
          name: 'user-repo-test',
          type: 'sqlite',
        },
      },
      metadata: {
        kind: 'test-storage',
        name: 'test-storage',
      },
    });
    await storage.start();

    const repo = storage.getCustomRepository(UserRepository);
    const user = new User({
      locale: {
        date: '',
        lang: '',
        time: '',
        timezone: '',
      },
      name: '',
      roles: [],
    });
    user.roleNames = [];

    const result = await repo.loadRoles(user);
    await storage.stop();

    expect(result.roles).to.deep.equal([]);
  });
});

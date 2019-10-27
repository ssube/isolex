import { ineeda } from 'ineeda';
import { stub } from 'sinon';
import { Repository } from 'typeorm';

import { Role } from '../../src/entity/auth/Role';
import { User } from '../../src/entity/auth/User';
import { UserRepository } from '../../src/entity/auth/UserRepository';
import { Context } from '../../src/entity/Context';
import { Storage } from '../../src/storage';

export function createMockStorage(): Storage {
  const repository = {
    save: (it: unknown) => Promise.resolve(it),
  };
  const getRepository = stub()
    .withArgs(Context).returns(ineeda<Repository<Context>>(repository))
    .withArgs(Role).returns(ineeda<Repository<Role>>(repository))
    .withArgs(User).returns(ineeda<Repository<User>>(repository));

  return ineeda<Storage>({
    getCustomRepository: () => ineeda<UserRepository>(),
    getRepository,
  });
}

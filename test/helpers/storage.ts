import { ineeda } from 'ineeda';
import { stub } from 'sinon';
import { Repository } from 'typeorm';

import { Role } from '../../src/entity/auth/Role';
import { User } from '../../src/entity/auth/User';
import { UserRepository } from '../../src/entity/auth/UserRepository';
import { Storage } from '../../src/storage';

export function createMockStorage(): Storage {
  const getRepository = stub()
    .withArgs(Role).returns(ineeda<Repository<Role>>())
    .withArgs(User).returns(ineeda<Repository<User>>());

  return ineeda<Storage>({
    getCustomRepository: () => ineeda<UserRepository>(),
    getRepository,
  });
}

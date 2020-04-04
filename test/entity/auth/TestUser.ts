import { expect } from 'chai';

import { Role } from '../../../src/entity/auth/Role';
import { User } from '../../../src/entity/auth/User';

const TEST_DATA = {
  locale: {
    date: '',
    lang: '',
    time: '',
    timezone: '',
  },
  name: 'test',
  roles: [],
};

describe('user entity', async () => {
  it('should convert itself to JSON', async () => {
    const user = new User(TEST_DATA);
    const json = user.toJSON();

    expect(json).to.have.property('id');
    expect(json).to.have.property('name');
  });

  it('should sync role names before writing to the DB', async () => {
    const user = new User(TEST_DATA);
    expect(user.roleNames).to.deep.equal([]);

    user.roles.push(new Role({
      grants: [],
      name: 'test',
    }));
    user.syncRoles();
    expect(user.roleNames).to.deep.equal([
      'test',
    ]);
  });
});

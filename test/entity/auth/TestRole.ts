import { expect } from 'chai';

import { Role } from '../../../src/entity/auth/Role';

describe('role entity', async () => {
  it('should serialize itself to JSON', async () => {
    const data = {
      grants: ['super-duper-admin'],
      name: 'test',
    };
    const role = new Role(data);
    expect(role.toJSON()).to.deep.include(data);
  });
});

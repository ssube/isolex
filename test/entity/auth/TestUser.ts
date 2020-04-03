import { expect } from 'chai';

import { User } from '../../../src/entity/auth/User';

describe('user entity', async () => {
  it('should convert itself to JSON', async () => {
    const user = new User({
      locale: {
        date: '',
        lang: '',
        time: '',
        timezone: '',
      },
      name: 'test',
      roles: [],
    });
    const json = user.toJSON();

    expect(json).to.have.property('id');
    expect(json).to.have.property('name');
  });
});

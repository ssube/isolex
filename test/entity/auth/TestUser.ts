import { expect } from 'chai';

import { User } from '../../../src/entity/auth/User';
import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('user entity', async () => {
  itLeaks('should convert itself to JSON', async () => {
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

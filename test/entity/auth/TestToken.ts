import { expect } from 'chai';

import { Token, TokenOptions } from '../../../src/entity/auth/Token';
import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('token entity', async () => {
  itLeaks('should copy options', async () => {
    const testProps = {
      audience: ['test'],
      expiresAt: new Date(),
      issuer: 'test',
      subject: 'test',
    };
    const data: TokenOptions = {
      ...testProps,
      data: {},
      grants: [],
      labels: {},
    };
    const token = new Token(data);
    expect(token).to.deep.include(testProps);
  });
});

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

  itLeaks('should sign tokens', async () => {
    const token = new Token({
      audience: ['test'],
      createdAt: new Date(),
      data: {},
      expiresAt: new Date(),
      grants: [],
      issuer: 'test',
      labels: {},
      subject: 'test',
    });
    token.id = 'test';
    const signed = token.sign('test');
    expect(signed).to.match(/[-_a-zA-Z0-9]+\.[-_a-zA-Z0-9]+\.[-_a-zA-Z0-9]+/);
  });

  itLeaks('should convert itself to json', async () => {
    const token = new Token({
      audience: ['test'],
      createdAt: new Date(),
      data: {},
      expiresAt: new Date(),
      grants: [],
      issuer: 'test',
      labels: {},
      subject: 'test',
    });
    const json = token.toJSON();
    expect(json).to.have.property('audience');
    expect(json).to.have.property('issuer');
    expect(json).to.have.property('subject');
  });

  itLeaks('should check grants', async () => {
    const token = new Token({
      audience: ['test'],
      createdAt: new Date(),
      data: {},
      expiresAt: new Date(),
      grants: ['test:*'],
      issuer: 'test',
      labels: {},
      subject: 'test',
    });
    expect(token.permit(['fail:foo'])).to.equal(false);
    expect(token.permit(['test:foo'])).to.equal(true);
  });

  itLeaks('should issue sessions with a user');
  itLeaks('should not issue sessions without a user');
});

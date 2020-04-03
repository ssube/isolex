import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { JsonWebTokenError } from 'jsonwebtoken';

import { Token, TokenOptions } from '../../../src/entity/auth/Token';
import { User } from '../../../src/entity/auth/User';

const TEST_SECRET = 'test-secret';
const TEST_BACKDATE = 1_000;

describe('token entity', async () => {
  it('should copy options', async () => {
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

  it('should sign tokens', async () => {
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

  it('should convert itself to json', async () => {
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

  it('should check grants', async () => {
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
    expect(token.checkGrants(['fail:foo'])).to.equal(false);
    expect(token.checkGrants(['test:foo'])).to.equal(true);
  });

  it('should issue sessions with a user', async () => {
    const user = ineeda<User>();
    const token = new Token({
      audience: [],
      data: {},
      expiresAt: new Date(),
      grants: [],
      issuer: '',
      labels: {},
      subject: '',
      user,
    });
    const session = token.session();
    expect(session.user).to.equal(user);
  });

  it('should not issue sessions without a user', async () => {
    const token = new Token({
      audience: [],
      data: {},
      expiresAt: new Date(),
      grants: [],
      issuer: '',
      labels: {},
      subject: '',
    });
    expect(() => token.session()).to.throw(NotFoundError);
  });
});

describe('verify token static method', async () => {
  it('should verify complete tokens', async () => {
    const token = new Token({
      audience: ['test'],
      data: {},
      expiresAt: new Date(Date.now() + TEST_BACKDATE),
      grants: [],
      issuer: 'test',
      labels: {},
      subject: 'test',
    });
    token.id = 'test';
    const jwt = token.sign(TEST_SECRET);

    expect(Token.verify(jwt, TEST_SECRET, {})).to.deep.include({
      iss: 'test',
    });
  });

  it('should reject expired tokens', async () => {
    const token = new Token({
      audience: ['test'],
      data: {},
      expiresAt: new Date(Date.now() - TEST_BACKDATE),
      grants: [],
      issuer: 'test',
      labels: {},
      subject: 'test',
    });
    token.id = 'test';
    const jwt = token.sign(TEST_SECRET);

    expect(() => Token.verify(jwt, TEST_SECRET, {})).to.throw(JsonWebTokenError);
  });
});

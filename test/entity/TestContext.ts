import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Role } from '../../src/entity/auth/Role';
import { Token } from '../../src/entity/auth/Token';
import { LOCALE_DEFAULT, User } from '../../src/entity/auth/User';
import { Context } from '../../src/entity/Context';
import { Listener } from '../../src/listener';

describe('context entity', async () => {
  it('should allow matching permissions', async () => {
    const grants = ['foo:bar', 'if:else,elif:end'];
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      source: ineeda<Listener>(),
      sourceUser: {
        name: 'test',
        uid: 'test',
      },
      user: new User({
        locale: LOCALE_DEFAULT,
        name: 'test',
        roles: [new Role({
          grants,
          name: 'test',
        })],
      }),
    });

    expect(context.getGrants()).to.deep.equal(grants);
    expect(context.checkGrants([
      'foo:bar',
      'if:else:end',
      'if:elif:end',
    ])).to.equal(true);
  });

  it('should deny missing permissions', async () => {
    const grants = ['foo:bin', 'if:else,elif:end'];
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      source: ineeda<Listener>(),
      sourceUser: {
        name: 'test',
        uid: 'test',
      },
      user: new User({
        locale: LOCALE_DEFAULT,
        name: 'test',
        roles: [new Role({
          grants,
          name: 'test',
        })],
      }),
    });

    expect(context.checkGrants([
      'foo:bar',
    ]), 'foo:bar grant').to.equal(false);
    expect(context.checkGrants([
      'if:if:end',
    ]), 'if:if:end grant').to.equal(false);
  });

  it('should get grants from every role', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      source: ineeda<Listener>(),
      sourceUser: {
        name: 'test',
        uid: 'test',
      },
      user: new User({
        locale: LOCALE_DEFAULT,
        name: 'test',
        roles: [new Role({
          grants: ['a', 'b'],
          name: 'test',
        }), new Role({
          grants: ['c'],
          name: 'test',
        })],
      }),
    });

    expect(context.getGrants()).to.deep.equal(['a', 'b', 'c']);
  });

  it('should get grants when there are no roles', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      source: ineeda<Listener>(),
      sourceUser: {
        name: 'test',
        uid: 'test',
      },
      user: new User({
        locale: LOCALE_DEFAULT,
        name: 'test',
        roles: [],
      }),
    });

    expect(context.getGrants()).to.deep.equal([]);
  });

  it('should get user id when a user exists', async () => {
    const user = new User({
      locale: LOCALE_DEFAULT,
      name: 'user',
      roles: [],
    });
    user.id = 'user';
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: 'uid',
      },
      user,
    });
    expect(context.getUserId()).to.equal('user');
  });

  it('should throw on get user ID when no user exists', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: 'uid',
      },
    });
    expect(() => context.getUserId()).to.throw(NotFoundError);
  });

  it('should get roles when no user exists', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: 'uid',
      },
    });
    expect(context.getGrants()).to.deep.equal([]);
  });

  it('should convert itself to JSON', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: 'uid',
      },
    });
    const json = context.toJSON();
    expect(json).to.have.property('channel');
    expect(json).to.have.property('id');
    expect(json).to.have.property('sourceUser');
  });

  it('should not permit grants when the token rejects them', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: 'uid',
      },
    });
    context.token = ineeda<Token>({
      checkGrants: () => false,
    });
    expect(context.checkGrants(['test'])).to.equal(false);
  });
});

const SOURCE_SERVICE = {
  kind: 'test-source',
  name: 'test-source',
};

const TARGET_SERVICE = {
  kind: 'test-target',
  name: 'test-target',
};

describe('redirect helpers', async () => {
  xit('should replace the target with the source when loopback is set');
  xit('should always set the forced target');
  xit('should set the default target when none is provided');
});

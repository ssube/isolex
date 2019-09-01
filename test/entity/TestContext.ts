import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Role } from '../../src/entity/auth/Role';
import { LOCALE_DEFAULT, User } from '../../src/entity/auth/User';
import { Context } from '../../src/entity/Context';
import { Listener } from '../../src/listener';
import { describeAsync, itAsync } from '../helpers/async';

describeAsync('context entity', async () => {
  itAsync('should allow matching permissions', async () => {
    const grants = ['foo:bar', 'if:else,elif:end'];
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      source: ineeda<Listener>(),
      uid: 'test',
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

  itAsync('should deny missing permissions', async () => {
    const grants = ['foo:bin', 'if:else,elif:end'];
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      source: ineeda<Listener>(),
      uid: 'test',
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

  itAsync('should get grants from every role', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      source: ineeda<Listener>(),
      uid: 'test',
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

  itAsync('should get grants when there are no roles', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      source: ineeda<Listener>(),
      uid: 'test',
      user: new User({
        locale: LOCALE_DEFAULT,
        name: 'test',
        roles: [],
      }),
    });

    expect(context.getGrants()).to.deep.equal([]);
  });

  itAsync('should get user id when a user exists', async () => {
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
      name: 'test',
      uid: 'uid',
      user,
    });
    expect(context.getUserId()).to.equal('user');
  });

  itAsync('should get uid when no user exists', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      uid: 'uid',
    });
    expect(context.getUserId()).to.equal('uid');
  });
});

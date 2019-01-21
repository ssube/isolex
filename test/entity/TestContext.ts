import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Role } from 'src/entity/auth/Role';
import { LOCALE_DEFAULT, User } from 'src/entity/auth/User';
import { Context } from 'src/entity/Context';
import { Listener } from 'src/listener';

import { describeAsync, itAsync } from 'test/helpers/async';

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
});

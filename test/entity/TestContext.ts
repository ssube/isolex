import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Role } from 'src/entity/auth/Role';
import { User } from 'src/entity/auth/User';
import { Context } from 'src/entity/Context';
import { Listener } from 'src/listener/Listener';

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
        name: 'test',
        roles: [new Role({
          grants,
          name: 'test',
       })],
      }),
    });

    expect(context.getPermissions()).to.deep.equal(grants);
    expect(context.permit([
      'foo:bar',
      'if:else:end',
      'if:elif:end',
    ])).to.equal(true);
  });

  itAsync('should deny missing permissions', async () => {
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
        name: 'test',
        roles: [new Role({
          grants,
          name: 'test',
       })],
      }),
    });

    expect(context.permit([
      'foo:bar',
    ])).to.equal(false);
    expect(context.permit([
      'if:if:end',
    ])).to.equal(false);
  });
});

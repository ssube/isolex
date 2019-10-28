import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { stub } from 'sinon';

import { Role } from '../../src/entity/auth/Role';
import { Token } from '../../src/entity/auth/Token';
import { LOCALE_DEFAULT, User } from '../../src/entity/auth/User';
import { Context, redirectService, redirectServiceRoute } from '../../src/entity/Context';
import { NotFoundError } from '../../src/error/NotFoundError';
import { Listener } from '../../src/listener';
import { ServiceModule } from '../../src/module/ServiceModule';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('context entity', async () => {
  itLeaks('should allow matching permissions', async () => {
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

  itLeaks('should deny missing permissions', async () => {
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

  itLeaks('should get grants from every role', async () => {
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

  itLeaks('should get grants when there are no roles', async () => {
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

  itLeaks('should get user id when a user exists', async () => {
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

  itLeaks('should get uid when no user exists', async () => {
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

  itLeaks('should get roles when no user exists', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      uid: 'uid',
    });
    expect(context.getGrants()).to.deep.equal([]);
  });

  itLeaks('should convert itself to JSON', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      uid: 'uid',
    });
    const json = context.toJSON();
    expect(json).to.have.property('channel');
    expect(json).to.have.property('id');
    expect(json).to.have.property('name');
    expect(json).to.have.property('uid');
  });

  itLeaks('should not permit grants when the token rejects them', async () => {
    const context = new Context({
      channel: {
        id: '',
        thread: '',
      },
      name: 'test',
      uid: 'uid',
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

describeLeaks('redirect helpers', async () => {
  describeLeaks('redirect route', async () => {
    itLeaks('should return the original source when source is set', async () => {
      const original = ineeda<Context>({
        source: ineeda<Listener>(),
        target: ineeda<Listener>(),
      });
      const route = {
        source: true,
        target: false,
      };
      const sm = ineeda<ServiceModule>();
      expect(redirectServiceRoute(original, route, sm)).to.equal(original.source);
    });

    itLeaks('should return the original target when target is set', async () => {
      const original = ineeda<Context>({
        source: ineeda<Listener>(),
        target: ineeda<Listener>(),
      });
      const route = {
        source: false,
        target: true,
      };
      const sm = ineeda<ServiceModule>();
      expect(redirectServiceRoute(original, route, sm)).to.equal(original.target);
    });

    itLeaks('should look up a service when service is set');

    itLeaks('should return undefined when nothing is set', async () => {
      expect(redirectServiceRoute(ineeda<Context>(), {}, ineeda<ServiceModule>())).to.equal(undefined);
    });
  });

  describeLeaks('redirect service', async () => {
    itLeaks('should return forced listener', async () => {
      const original = new Context({
        channel: {
          id: '',
          thread: '',
        },
        name: '',
        source: ineeda<Listener>(),
        target: ineeda<Listener>(),
        uid: '',
      });

      expect(redirectService(original, {
        defaults: {},
        forces: {
          source: {
            target: true,
          },
        },
      }, ineeda<ServiceModule>(), 'source')).to.equal(original.target);
    });

    itLeaks('should return original listener', async () => {
      const original = new Context({
        channel: {
          id: '',
          thread: '',
        },
        name: '',
        source: ineeda<Listener>(),
        uid: '',
      });

      expect(redirectService(original, {
        defaults: {},
        forces: {},
      }, ineeda<ServiceModule>(), 'source')).to.equal(original.source);
    });

    itLeaks('should return default listener', async () => {
      const source = ineeda<Listener>();
      const target = ineeda<Listener>();
      const original = new Context({
        channel: {
          id: '',
          thread: '',
        },
        name: '',
        uid: '',
      });

      expect(redirectService(original, {
        defaults: {
          source: {
            service: TARGET_SERVICE,
          },
        },
        forces: {},
      }, ineeda<ServiceModule>({
        getService: stub().withArgs(SOURCE_SERVICE).returns(source).withArgs(TARGET_SERVICE).returns(target),
      }), 'source')).to.equal(target);
    });

    itLeaks('should throw when no listener is available', async () => {
      const original = new Context({
        channel: {
          id: '',
          thread: '',
        },
        name: '',
        uid: '',
      });

      expect(() => redirectService(original, {
        defaults: {},
        forces: {},
      }, ineeda<ServiceModule>(), 'source')).to.throw(NotFoundError);
    });
  });
});

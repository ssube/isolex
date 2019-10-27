import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { User } from '../../src/entity/auth/User';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { NotImplementedError } from '../../src/error/NotImplementedError';
import { LoopbackListener } from '../../src/listener/LoopbackListener';
import { Service } from '../../src/Service';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_METADATA = {
  kind: 'loopback-listener',
  name: 'test-listener',
};

const TEST_TARGET = {
  kind: 'test-target',
  name: 'test-target',
};

describeLeaks('loopback listener', async () => {
  itLeaks('should send messages to the bot', async () => {
    const { container, services } = await createServiceContainer();

    const svc = ineeda<Service>(TEST_TARGET);
    services.addService(svc);

    const receive = spy();
    const listener = await createService(container, LoopbackListener, {
      [INJECT_BOT]: ineeda<Bot>({
        receive,
      }),
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {
            target: {
              service: TEST_TARGET,
              source: false,
            }
          }
        },
        strict: false,
      },
      metadata: TEST_METADATA,
    });
    await listener.start();

    const ctxOptions = {
      name: 'test-user',
      uid: 'test-uid',
    };
    const msgOptions = {
      body: 'test-body',
      type: TYPE_TEXT,
    };

    const msg = new Message({
      context: new Context({
        channel: {
          id: '',
          thread: '',
        },
        ...ctxOptions,
      }),
      labels: {},
      reactions: [],
      ...msgOptions,
    });
    await listener.send(msg);

    expect(receive).to.have.callCount(1)
      .and.been.calledWithMatch(match.has('body', msgOptions.body)
        .and(match.has('type', msgOptions.type)));
  });

  itLeaks('should throw when fetching messages', async () => {
    const { container, services } = await createServiceContainer();

    const svc = ineeda<Service>(TEST_TARGET);
    services.addService(svc);

    const listener = await createService(container, LoopbackListener, {
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {
            target: {
              service: TEST_TARGET,
              source: false,
            }
          }
        },
        strict: false,
      },
      metadata: TEST_METADATA,
    });
    await listener.start();

    await expect(listener.fetch({
      channel: '',
    })).to.eventually.be.rejectedWith(NotImplementedError);
  });

  itLeaks('should throw when creating sessions', async () => {
    const { container, services } = await createServiceContainer();

    const svc = ineeda<Service>(TEST_TARGET);
    services.addService(svc);

    const listener = await createService(container, LoopbackListener, {
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {
            target: {
              service: TEST_TARGET,
              source: false,
            }
          }
        },
        strict: false,
      },
      metadata: TEST_METADATA,
    });
    await listener.start();

    await expect(listener.createSession('test', ineeda<User>())).to.eventually.be.rejectedWith(NotImplementedError);
  });

  itLeaks('should not provide sessions', async () => {
    const { container, services } = await createServiceContainer();

    const svc = ineeda<Service>(TEST_TARGET);
    services.addService(svc);

    const listener = await createService(container, LoopbackListener, {
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {
            target: {
              service: TEST_TARGET,
              source: false,
            }
          }
        },
        strict: false,
      },
      metadata: TEST_METADATA,
    });
    await listener.start();

    await expect(listener.getSession('test')).to.eventually.equal(undefined);
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';
import { spy } from 'sinon';

import { INJECT_CLOCK, INJECT_SCHEMA } from '../../src/BaseService';
import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { NotInitializedError } from '../../src/error/NotInitializedError';
import { MessageInterval } from '../../src/interval/MessageInterval';
import { TransformModule } from '../../src/module/TransformModule';
import { Schema } from '../../src/schema';
import { Service } from '../../src/Service';
import { Clock } from '../../src/utils/Clock';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_SVC = 'some-service';
const TEST_SVC2 = 'test-service';
const TEST_TARGET = 'test-target';

const TEST_CONFIG = {
  data: {
    defaultContext: {
      channel: {
        id: '',
        thread: '',
      },
      name: '',
      uid: '',
    },
    defaultMessage: {
      body: '',
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    },
    defaultTarget: {
      kind: TEST_SVC2,
      name: TEST_TARGET,
    },
    filters: [],
    frequency: {
      time: '30s',
    },
    services: [{
      kind: TEST_SVC,
      name: TEST_SVC,
    }],
    strict: false,
    transforms: [{
      data: {
        filters: [],
        strict: false,
        templates: {
          body: 'foo',
        },
      },
      metadata: {
        kind: 'template-transform',
        name: 'test-template',
      }
    }],
  },
  metadata: {
    kind: 'message-endpoint',
    name: 'test-endpoint'
  },
};

describeLeaks('message interval', async () => {
  itLeaks('should notify target services', async () => {
    const sendMessage = spy();
    const bot = ineeda<Bot>({
      sendMessage,
    });
    const { container, services } = await createServiceContainer(new TransformModule());
    services.bind(INJECT_SCHEMA).toInstance(new Schema());
    services.bind(INJECT_BOT).toInstance(bot);
    services.addService(ineeda<Service>({
      kind: TEST_SVC2,
      name: TEST_TARGET,
    }));
    const interval = await createService(container, MessageInterval, {
      [INJECT_BOT]: bot,
      [INJECT_CLOCK]: ineeda<Clock>({
        setInterval() { /* noop */ },
      }),
      ...TEST_CONFIG,
    });
    await interval.start();
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>({}));
    expect(status).to.equal(0);
    expect(sendMessage).to.have.callCount(1);
  });

  itLeaks('should throw when transform body is missing', async () => {
    const sendMessage = spy();
    const bot = ineeda<Bot>({
      sendMessage,
    });
    const { container, services } = await createServiceContainer(new TransformModule());
    services.bind(INJECT_SCHEMA).toInstance(new Schema());
    services.bind(INJECT_BOT).toInstance(bot);
    services.addService(ineeda<Service>({
      kind: TEST_SVC2,
      name: TEST_TARGET,
    }));
    const interval = await createService(container, MessageInterval, {
      [INJECT_BOT]: bot,
      [INJECT_CLOCK]: ineeda<Clock>({
        setInterval() { /* noop */ },
      }),
      data: {
        ...TEST_CONFIG.data,
        transforms: [],
      },
      metadata: TEST_CONFIG.metadata,
    });
    await interval.start();

    expect(sendMessage).to.have.callCount(0);
    return expect(interval.tick(ineeda<Context>(), ineeda<Tick>({}))).to.eventually.be.rejectedWith(BaseError);
  });

  itLeaks('should throw if not started', async () => {
    const sendMessage = spy();
    const bot = ineeda<Bot>({
      sendMessage,
    });
    const { container, services } = await createServiceContainer(new TransformModule());
    services.bind(INJECT_SCHEMA).toInstance(new Schema());
    services.bind(INJECT_BOT).toInstance(bot);
    services.addService(ineeda<Service>({
      kind: TEST_SVC2,
      name: TEST_TARGET,
    }));
    const interval = await createService(container, MessageInterval, {
      [INJECT_BOT]: bot,
      [INJECT_CLOCK]: ineeda<Clock>({
        setInterval() { /* noop */ },
      }),
      data: {
        ...TEST_CONFIG.data,
        transforms: [],
      },
      metadata: TEST_CONFIG.metadata,
    });

    await expect(interval.tick(ineeda<Context>(), ineeda<Tick>({}))).to.eventually.be.rejectedWith(NotInitializedError);
    await interval.start();
    await interval.stop();
    await expect(interval.tick(ineeda<Context>(), ineeda<Tick>({}))).to.eventually.be.rejectedWith(NotInitializedError);
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { createBot, CreateOptions, ExitStatus, runBot } from '../src/app';
import { Bot, BotDefinition } from '../src/Bot';
import { Service, ServiceEvent } from '../src/Service';
import { defer } from '../src/utils/Async';
import { SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from '../src/utils/Signal';
import { describeLeaks, itLeaks } from './helpers/async';
import { getTestLogger } from './helpers/logger';

const MAX_START_TIME = 250; // ms
const MAX_SVC_TIME = 25;

const TEST_SERVICE = 'test-service';
const TEST_CONFIG: BotDefinition = {
  data: {
    controllers: [],
    endpoints: [],
    filters: [],
    intervals: [],
    listeners: [],
    locale: {
      data: {
        lang: 'en',
      },
      metadata: {
        kind: 'locale',
        name: 'default-locale',
      },
    },
    logger: {
      level: 'info',
      name: 'test-logger',
    },
    modules: [],
    parsers: [],
    process: {
      pid: {
        file: 'test.pid',
      },
    },
    services: {
      timeout: MAX_SVC_TIME,
    },
    storage: {
      data: {
        migrate: false,
        orm: {
          database: './out/test.db',
          type: 'sqlite',
        },
      },
      metadata: {
        kind: 'storage',
        name: 'typeorm',
      },
    },
  },
  metadata: {
    kind: 'bot',
    name: 'test-bot',
  },
};

describeLeaks('app bot stuff', async () => {
  itLeaks('should create a bot and container', async () => {
    const { bot } = await createBot({
      config: TEST_CONFIG,
      logger: getTestLogger(),
    });

    expect(bot).to.be.an.instanceOf(Bot);
  });

  itLeaks('should run a bot', async () => {
    const options = {
      config: TEST_CONFIG,
      logger: getTestLogger(),
    };
    const { bot } = await createBot(options);

    const pendingStatus = runBot(options, bot);
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]); // wait for the bot to start up

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
  });

  /* tslint:disable:no-identical-functions */
  itLeaks('should reset metrics while running', async () => {
    const options: CreateOptions = {
      config: {
        data: {
          ...TEST_CONFIG.data,
          controllers: [{
            data: {
              filters: [],
              strict: true,
              transforms: [],
            },
            metadata: {
              kind: TEST_SERVICE,
              name: TEST_SERVICE,
            },
          }],
        },
        metadata: TEST_CONFIG.metadata,
      },
      logger: getTestLogger(),
    };
    const { bot, ctr } = await createBot(options);

    const notify = spy();
    const svc = ineeda<Service>({
      notify,
      stop: spy(),
    });

    const [ module ] = ctr.getModules();
    module.bind(TEST_SERVICE).toInstance(svc);

    const pendingStatus = runBot(options, bot);
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]); // wait for the bot to start up

    process.kill(process.pid, SIGNAL_RESET); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
    expect(notify).to.have.callCount(3)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Reset)
      .and.been.calledWith(ServiceEvent.Stop);
  });

  itLeaks('should reload config while running', async () => {
    const options: CreateOptions = {
      config: {
        data: {
          ...TEST_CONFIG.data,
          controllers: [{
            data: {
              filters: [],
              strict: true,
              transforms: [],
            },
            metadata: {
              kind: TEST_SERVICE,
              name: TEST_SERVICE,
            },
          }],
        },
        metadata: TEST_CONFIG.metadata,
      },
      logger: getTestLogger(),
    };
    const { bot, ctr } = await createBot(options);

    const notify = spy();
    const svc = ineeda<Service>({
      notify,
      stop: spy(),
    });

    const [ module ] = ctr.getModules();
    module.bind(TEST_SERVICE).toInstance(svc);

    const pendingStatus = runBot(options, bot);
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]); // wait for the bot to start up

    process.kill(process.pid, SIGNAL_RELOAD); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
    expect(notify).to.have.callCount(3)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Reload)
      .and.been.calledWith(ServiceEvent.Stop);

  });
});

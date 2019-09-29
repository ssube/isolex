import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { defaultTo } from 'lodash';
import { spy } from 'sinon';

import { createBot, CreateOptions, ExitStatus, main, runBot } from '../src/app';
import { Bot, BotDefinition } from '../src/Bot';
import { Service, ServiceEvent } from '../src/Service';
import { defer, waitFor } from '../src/utils/Async';
import { SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from '../src/utils/Signal';
import { describeLeaks, itLeaks } from './helpers/async';
import { getTestLogger } from './helpers/logger';

const MAIN_START_MULT = 20; // how much longer main takes vs normal start/signal tests
const MAX_SIGNAL_TIME = 50; // ms
const MAX_START_TIME = 250; // ms
const MAX_SVC_TIME = 50; // ms

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

const TEST_CONFIG_SERVICE: CreateOptions = {
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

const TEST_ARGS_VALID = [
  '--config-name',
  'isolex.yml',
  '--config-path',
  defaultTo(process.env.DOCS_PATH, __dirname),
];

const TEST_ARGS_INVALID = [
  '--config-name',
  'invalid.yml',
  '--config-path',
  defaultTo(process.env.DOCS_PATH, __dirname),
];

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
    const { bot, ctr } = await createBot(TEST_CONFIG_SERVICE);

    const notify = spy();
    const svc = ineeda<Service>({
      notify,
      stop: spy(),
    });

    const [module] = ctr.getModules();
    module.bind(TEST_SERVICE).toInstance(svc);

    const pendingStatus = runBot(TEST_CONFIG_SERVICE, bot);
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]); // wait for the bot to start up

    process.kill(process.pid, SIGNAL_RESET); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_SIGNAL_TIME),
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
    const { bot, ctr } = await createBot(TEST_CONFIG_SERVICE);

    const notify = spy();
    const svc = ineeda<Service>({
      notify,
      stop: spy(),
    });

    const [module] = ctr.getModules();
    module.bind(TEST_SERVICE).toInstance(svc);

    const pendingStatus = runBot(TEST_CONFIG_SERVICE, bot);
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]); // wait for the bot to start up

    process.kill(process.pid, SIGNAL_RELOAD); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_SIGNAL_TIME),
    ]);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
    expect(notify).to.have.callCount(3)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Reload)
      .and.been.calledWith(ServiceEvent.Stop);

  });

  xit('should ignore unknown signals', async () => {
    const { bot, ctr } = await createBot(TEST_CONFIG_SERVICE);

    const start = spy();
    const notify = spy();
    const svc = ineeda<Service>({
      notify,
      start,
      stop: spy(),
    });

    const [module] = ctr.getModules();
    module.bind(TEST_SERVICE).toInstance(svc);

    const pendingStatus = runBot(TEST_CONFIG_SERVICE, bot);
    await waitFor(() => {
      return start.callCount > 0;
    }, MAX_START_TIME, 1); // wait for the bot to start up

    process.kill(process.pid, 1); // @TODO: figure out what signal to use
    await defer(MAX_SIGNAL_TIME);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
    expect(notify).to.have.callCount(2)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Stop);
  });
});

/* tslint:disable:no-unbound-method */
describeLeaks('main', async () => {
  itLeaks('should return exit status', async () => {
    const pendingStatus = main(TEST_ARGS_VALID);
    await defer(MAX_START_TIME * MAIN_START_MULT);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const timeout = defer(MAX_SIGNAL_TIME * MAIN_START_MULT);
    const status = await Promise.race([pendingStatus, timeout]);

    expect(status).to.equal(ExitStatus.Success);
  });

  itLeaks('should validate the config before starting', async () => {
    const status = await main(TEST_ARGS_INVALID);

    expect(status).to.equal(ExitStatus.Error);
  });

  itLeaks('should test config without starting', async () => {
    const status = await main([
      ...TEST_ARGS_VALID,
      '--test',
    ]);

    expect(status).to.equal(ExitStatus.Success);
  });

  itLeaks('should fail when testing invalid config', async () => {
    const status = await main([
      ...TEST_ARGS_INVALID,
      '--test',
    ]);

    expect(status).to.equal(ExitStatus.Error);
  });
});

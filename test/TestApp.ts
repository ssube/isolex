import {
  defer,
  getTestLogger,
  SIGNAL_RELOAD,
  SIGNAL_RESET,
  SIGNAL_STOP,
} from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { defaultTo } from 'lodash';
import { BaseError, LogLevel } from 'noicejs';
import { stub } from 'sinon';

import { createBot, CreateOptions, ExitStatus, main, runBot } from '../src/app';
import { Bot, BotDefinition } from '../src/Bot';
import { ServiceEvent } from '../src/Service';
import { describeLeaks, itLeaks } from './helpers/async';
import { serviceSpy } from './helpers/container';

const MAX_SIGNAL_TIME = 100; // ms
const MAX_START_TIME = 750; // ms

const MAIN_START_TIME = 4000; // ms
const MAIN_STOP_TIME = 500;

const TEST_SERVICE = 'test-service';
const TEST_CONFIG: BotDefinition = {
  data: {
    controllers: [],
    endpoints: [],
    generators: [],
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
      level: LogLevel.Warn,
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
      timeout: MAX_SIGNAL_TIME,
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
          redirect: {
            defaults: {},
            forces: {},
          },
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
  'test-valid.yml',
  '--config-path',
  defaultTo(process.env.DOCS_PATH, __dirname),
];

const TEST_ARGS_INVALID = [
  '--config-name',
  'test-invalid.yml',
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
    const { svc, spies } = await serviceSpy({});

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
    expect(spies.notify).to.have.callCount(3)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Reset)
      .and.been.calledWith(ServiceEvent.Stop);
  });

  itLeaks('should reload config while running', async () => {
    const { bot, ctr } = await createBot(TEST_CONFIG_SERVICE);
    const { svc, spies } = await serviceSpy({});

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
    expect(spies.notify).to.have.callCount(3)
      .and.been.calledWith(ServiceEvent.Start)
      .and.been.calledWith(ServiceEvent.Reload)
      .and.been.calledWith(ServiceEvent.Stop);
  });

  itLeaks('should handle errors starting the bot', async () => {
    const start = stub().throws(BaseError);
    const bot = ineeda<Bot>({
      start,
    });
    return expect(runBot({
      config: TEST_CONFIG,
      logger: getTestLogger(),
    }, bot)).to.eventually.equal(ExitStatus.Error);
  });
});

/* tslint:disable:no-unbound-method */
describeLeaks('main', async () => {
  itLeaks('should return exit status', async () => {
    const pendingStatus = main(TEST_ARGS_VALID);
    await defer(MAIN_START_TIME);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const timeout = defer(MAIN_STOP_TIME);
    const status = await Promise.race([pendingStatus, timeout]);

    expect(status).to.equal(ExitStatus.Success, 'exit status should be set and successful');
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

import { expect } from 'chai';
import { ConsoleLogger } from 'noicejs';

import { createBot, ExitStatus, runBot } from '../src/app';
import { Bot, BotDefinition } from '../src/Bot';
import { defer } from '../src/utils/Async';
import { SIGNAL_RELOAD, SIGNAL_RESET, SIGNAL_STOP } from '../src/utils/Signal';
import { describeLeaks, itLeaks } from './helpers/async';
import { getTestLogger } from './helpers/logger';

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
      timeout: 0,
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

const MAX_START_TIME = 250; // ms

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

  itLeaks('should reset metrics while running', async () => {
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

    process.kill(process.pid, SIGNAL_RESET); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
  });
  itLeaks('should reload config while running', async () => {
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

    process.kill(process.pid, SIGNAL_RELOAD); // reset metrics
    await Promise.race([
      pendingStatus,
      defer(MAX_START_TIME),
    ]);

    process.kill(process.pid, SIGNAL_STOP); // ask it to stop
    const status = await pendingStatus;

    expect(status).to.equal(ExitStatus.Success);
  });
});

import { defer, getTestLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { LogLevel } from 'noicejs';
import { Registry } from 'prom-client';
import { spy } from 'sinon';

import { INJECT_LOGGER, INJECT_METRICS, INJECT_SCHEMA } from '../src/BaseService';
import { Bot, BotData } from '../src/Bot';
import { Command, CommandVerb } from '../src/entity/Command';
import { BotModule } from '../src/module/BotModule';
import { EntityModule } from '../src/module/EntityModule';
import { MigrationModule } from '../src/module/MigrationModule';
import { ServiceModule } from '../src/module/ServiceModule';
import { Schema } from '../src/schema';
import { ServiceEvent } from '../src/Service';
import { createContainer } from './helpers/container';

const TEST_DELAY = 50; // TODO: why do these need a delay?
const TEST_CONFIG: BotData = {
  controllers: [],
  endpoints: [],
  generators: [],
  listeners: [],
  locale: {
    data: {
      lang: 'en-US',
    },
    metadata: {
      kind: 'locale',
      name: 'test-locale',
    },
  },
  logger: {
    level: LogLevel.Info,
    name: 'test',
  },
  modules: [],
  parsers: [],
  process: {
    pid: {
      file: './out/test.pid',
    },
  },
  services: {
    timeout: 1000,
  },
  storage: {
    data: {
      migrate: true,
      orm: {
        database: './out/test.db',
        type: 'sqlite',
      },
    },
    metadata: {
      kind: 'storage',
      name: 'test-storage',
    },
  },
};

async function createBot() {
  const { container } = await createContainer(new BotModule({
    logger: getTestLogger(),
  }), new ServiceModule({
    timeout: 1000,
  }), new EntityModule(), new MigrationModule());
  const bot = await container.create(Bot, {
    [INJECT_SCHEMA]: new Schema(),
    data: TEST_CONFIG,
    metadata: {
      kind: 'bot',
      name: 'test-bot',
    },
  });
  return { bot, container };
}

describe('bot service', async () => {
  it('should reset metrics', async () => {
    const { container } = await createContainer(new BotModule({
      logger: getTestLogger(),
    }), new ServiceModule({
      timeout: 1000,
    }));
    const resetMetrics = spy();
    const bot = await container.create(Bot, {
      [INJECT_METRICS]: ineeda<Registry>({
        registerMetric: () => { /* noop */ },
        resetMetrics,
      }),
      [INJECT_SCHEMA]: new Schema(),
      data: TEST_CONFIG,
      metadata: {
        kind: 'bot',
        name: 'test-bot',
      },
    });
    await bot.notify(ServiceEvent.Reset);
    expect(resetMetrics).to.have.callCount(1);
  });

  it('should have connection status', async () => {
    const { container } = await createContainer(new BotModule({
      logger: getTestLogger(),
    }), new ServiceModule({
      timeout: 1000,
    }));
    const bot = await container.create(Bot, {
      [INJECT_SCHEMA]: new Schema(),
      data: TEST_CONFIG,
      metadata: {
        kind: 'bot',
        name: 'test-bot',
      },
    });
    expect(bot.isConnected).to.equal(false);
  });

  xit('should execute commands', async () => {
    const { container } = await createContainer(new BotModule({
      logger: getTestLogger(),
    }), new ServiceModule({
      timeout: 1000,
    }), new EntityModule(), new MigrationModule());
    const bot = await container.create(Bot, {
      [INJECT_LOGGER]: getTestLogger(true),
      [INJECT_SCHEMA]: new Schema(),
      data: TEST_CONFIG,
      metadata: {
        kind: 'bot',
        name: 'test-bot',
      },
    });
    await bot.start();
    const results = await bot.executeCommand(new Command({
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    }));
    await defer(TEST_DELAY);
    await bot.stop();
    expect(results.length).to.equal(0);
  });

  xit('should send messages', async () => {
    const { container } = await createContainer(new BotModule({
      logger: getTestLogger(),
    }), new ServiceModule({
      timeout: 1000,
    }), new EntityModule(), new MigrationModule());
    const bot = await container.create(Bot, {
      [INJECT_SCHEMA]: new Schema(),
      data: TEST_CONFIG,
      metadata: {
        kind: 'bot',
        name: 'test-bot',
      },
    });
    await bot.start();
    const results = await bot.sendMessage();
    await defer(TEST_DELAY);
    await bot.stop();
    expect(results.length).to.equal(0);
  });

  xit('should execute commands', async () => {
    const { bot } = await createBot();
    await bot.start();

    const cmd = await bot.executeCommand(ineeda<Command>());
    expect(cmd).to.equal(true);
  });
});

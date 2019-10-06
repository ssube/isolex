import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { LogLevel } from 'noicejs';
import { Registry } from 'prom-client';
import { spy } from 'sinon';

import { INJECT_METRICS, INJECT_SCHEMA } from '../src/BaseService';
import { Bot, BotData } from '../src/Bot';
import { INJECT_STORAGE } from '../src/BotService';
import { BotModule } from '../src/module/BotModule';
import { ServiceModule } from '../src/module/ServiceModule';
import { Schema } from '../src/schema';
import { ServiceEvent } from '../src/Service';
import { describeLeaks, itLeaks } from './helpers/async';
import { createContainer } from './helpers/container';
import { getTestLogger } from './helpers/logger';

const TEST_CONFIG: BotData = {
  controllers: [],
  endpoints: [],
  intervals: [],
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
      file: '../out/isolex.pid',
    },
  },
  services: {
    timeout: 1000,
  },
  storage: {
    data: {
      migrate: false,
      orm: {
        database: '',
        type: 'sqlite',
      },
    },
    metadata: {
      kind: 'storage',
      name: 'test-storage',
    },
  },
};

describeLeaks('bot service', async () => {
  itLeaks('should reset metrics', async () => {
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

  itLeaks('should have connection status', async () => {
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
});

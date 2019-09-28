import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';
import { Registry } from 'prom-client';
import { spy } from 'sinon';

import { INJECT_LOGGER, INJECT_METRICS, INJECT_SCHEMA } from '../src/BaseService';
import { Bot } from '../src/Bot';
import { BotModule } from '../src/module/BotModule';
import { ServiceModule } from '../src/module/ServiceModule';
import { Schema } from '../src/schema';
import { ServiceEvent } from '../src/Service';
import { describeLeaks, itLeaks } from './helpers/async';
import { createContainer } from './helpers/container';

describeLeaks('bot service', async () => {
  itLeaks('should reset metrics', async () => {
    const { container } = await createContainer(new BotModule({
      logger: ConsoleLogger.global,
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
      data: {
        controllers: [],
        endpoints: [],
        filters: [],
        intervals: [],
        listeners: [],
        locale: {
          [INJECT_LOGGER]: ConsoleLogger.global,
          container,
          data: {
            lang: 'en-US',
          },
          metadata: {
            kind: 'locale',
            name: 'test-locale',
          },
        },
        logger: {
          level: 'info',
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
          [INJECT_LOGGER]: ConsoleLogger.global,
          container,
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
      },
      metadata: {
        kind: 'bot',
        name: 'test-bot',
      },
    });
    await bot.notify(ServiceEvent.Reset);
    expect(resetMetrics).to.have.callCount(1);
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';
import { Registry } from 'prom-client';
import { spy } from 'sinon';

import { INJECT_METRICS, INJECT_SCHEMA, INJECT_LOGGER } from 'src/BaseService';
import { Bot } from 'src/Bot';
import { BotModule } from 'src/module/BotModule';
import { ServiceModule } from 'src/module/ServiceModule';
import { Schema } from 'src/schema';
import { ServiceEvent } from 'src/Service';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('bot service', async () => {
  itAsync('should reset metrics', async () => {
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
          container,
          [INJECT_LOGGER]: ConsoleLogger.global,
          metadata: {
            kind: 'locale',
            name: 'test-locale',
          },
          data: {
            lang: 'en-US',
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
          container,
          [INJECT_LOGGER]: ConsoleLogger.global,
          metadata: {
            kind: 'storage',
            name: 'test-storage',
          },
          data: {
            migrate: false,
            orm: {
              database: '',
              type: 'sqlite',
            },
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

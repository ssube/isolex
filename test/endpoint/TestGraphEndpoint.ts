import { expect } from 'chai';
import { Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { GraphEndpoint } from '../../src/endpoint/GraphEndpoint';
import { BotModule } from '../../src/module/BotModule';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestLogger } from '../helpers/logger';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<GraphEndpoint> {
  const storage = ineeda<Storage>({
    getRepository() {
      return ineeda<Repository<{}>>();
    },
  });
  const bot = ineeda<Bot>({
    getStorage() {
      return storage;
    },
  });

  const { container, module } = await createServiceContainer(new BotModule({
    logger: getTestLogger(),
  }));
  module.bind(INJECT_BOT).toInstance(bot);
  module.bind(INJECT_STORAGE).toInstance(storage);

  return createService(container, GraphEndpoint, {
    data: {
      filters: [],
      graph: {
        data: {
          filters: [],
          strict: false,
        },
        metadata: {
          kind: 'graph-schema',
          name: 'debug-graph',
        },
      },
      graphiql: true,
      strict: false,
    },
    metadata: {
      kind: 'debug-endpoint',
      name: 'test-endpoint',
    },
  });
}

// tslint:disable:no-identical-functions
describeLeaks('graph endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/graph');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(false, false);
    const use = spy();
    const router = ineeda<Router>({
      use,
    });
    await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
      router,
    });
    expect(use).to.have.callCount(1);
  });
});

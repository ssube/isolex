import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { match, spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { MetricsEndpoint } from '../../src/endpoint/MetricsEndpoint';
import { BotModule } from '../../src/module/BotModule';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestLogger } from '../helpers/logger';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<MetricsEndpoint> {
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

  return createService(container, MetricsEndpoint, {
    data: {
      filters: [],
      strict: false,
    },
    metadata: {
      kind: 'metrics-endpoint',
      name: 'test-endpoint',
    },
  });
}

function createRequest() {
  const end = spy();
  const set = spy();
  const response = ineeda<Response>({
    end,
    set,
  });
  return { end, response, set };
}

// tslint:disable:no-identical-functions
describeLeaks('metrics endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/metrics');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(false, false);
    const get = spy();
    const router = ineeda<Router>({
      get,
    });
    const result = await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
      router,
    });
    expect(result).to.equal(router, 'must return the passed router');
    expect(get).to.have.callCount(1);
  });

  describeLeaks('index route', async () => {
    itLeaks('should return metrics', async () => {
      const endpoint = await createEndpoint(true, true);
      const { end, response } = createRequest();
      await endpoint.getIndex(ineeda<Request>({}), response);
      expect(end).to.have.been.calledOnce.and.calledWithMatch(match.string);
    });
  });
});

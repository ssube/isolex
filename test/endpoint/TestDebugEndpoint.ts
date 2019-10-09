import { expect } from 'chai';
import { NextFunction, Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { DebugEndpoint } from '../../src/endpoint/DebugEndpoint';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<DebugEndpoint> {
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

  const { container } = await createServiceContainer();
  return createService(container, DebugEndpoint, {
    [INJECT_BOT]: bot,
    [INJECT_STORAGE]: storage,
    data: {
      filters: [],
      strict: false,
    },
    metadata: {
      kind: 'debug-endpoint',
      name: 'test-endpoint',
    },
  });
}

// tslint:disable:no-identical-functions
describeLeaks('debug endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/debug');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(false, false);
    const get = spy();
    const router = ineeda<Router>({
      get,
    });
    const result = await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>({
        authenticate(method: string) {
          return (req: Request, res: Response, next: NextFunction) => {
            next();
          };
        },
      }),
      router,
    });
    expect(result).to.equal(router, 'must return the passed router');
    expect(get).to.have.callCount(1);
  });
});

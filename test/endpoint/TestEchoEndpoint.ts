import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { EchoEndpoint } from '../../src/endpoint/EchoEndpoint';
import { User } from '../../src/entity/auth/User';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<EchoEndpoint> {
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
  return createService(container, EchoEndpoint, {
    [INJECT_BOT]: bot,
    [INJECT_STORAGE]: storage,
    data: {
      filters: [],
      strict: false,
    },
    metadata: {
      kind: 'echo-endpoint',
      name: 'test-endpoint',
    },
  });
}

// tslint:disable:no-identical-functions
describeLeaks('echo endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/echo');
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
    itLeaks('should print default message without user', async () => {
      const endpoint = await createEndpoint(true, true);
      const send = spy();
      await endpoint.getIndex(ineeda<Request>({
        get user(): User | undefined {
          return undefined;
        },
        set user(val: User | undefined) { /* noop */ }
      }), ineeda<Response>({
        send,
      }));
      expect(send).to.have.been.calledOnce.and.calledWithExactly('Hello World!');
    });

    itLeaks('should print personal message with user', async () => {
      const endpoint = await createEndpoint(true, true);
      const send = spy();
      await endpoint.getIndex(ineeda<Request>({
        user: ineeda<User>({
          name: 'Bob',
        }),
      }), ineeda<Response>({
        send,
      }));
      expect(send).to.have.been.calledOnce.and.calledWithExactly('Hello Bob!');
    });
  });
});

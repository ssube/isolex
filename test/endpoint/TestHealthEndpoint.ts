import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { HealthEndpoint, STATUS_ERROR, STATUS_SUCCESS } from '../../src/endpoint/HealthEndpoint';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<HealthEndpoint> {
  const storage = ineeda<Storage>({
    get isConnected() {
      return storageReady;
    },
    set isConnected(val: boolean) { /* noop */ },
    getRepository() {
      return ineeda<Repository<{}>>();
    },
  });
  const bot = ineeda<Bot>({
    get isConnected() {
      return botReady;
    },
    set isConnected(val: boolean) { /* noop */ },
    getStorage() {
      return storage;
    },
  });
  const { container } = await createServiceContainer();
  return createService(container, HealthEndpoint, {
    [INJECT_BOT]: bot,
    [INJECT_STORAGE]: storage,
    data: {
      filters: [],
      strict: false,
    },
    metadata: {
      kind: 'health-endpoint',
      name: 'test-endpoint',
    },
  });
}

function createRequest() {
  const status = spy();
  const response = ineeda<Response>({
    sendStatus: status,
  });
  return { response, status };
}

// tslint:disable:no-identical-functions
describeLeaks('health endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/health');
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
    expect(get).to.have.callCount(2);
  });

  describeLeaks('liveness route', async () => {
    itLeaks('should succeed when bot is connected', async () => {
      const endpoint = await createEndpoint(true, true);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when bot is not connected', async () => {
      const endpoint = await createEndpoint(false, false);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });

  describeLeaks('readiness route', async () => {
    itLeaks('should succeed when storage is connected', async () => {
      const endpoint = await createEndpoint(true, true);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when storage is not connected', async () => {
      const endpoint = await createEndpoint(false, false);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });
});

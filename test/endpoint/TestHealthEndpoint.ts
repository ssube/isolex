import { expect } from 'chai';
import { Request, Response } from 'express';
import { ineeda } from 'ineeda';
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

// tslint:disable:no-identical-functions
describeLeaks('health endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/health');
  });

  describeLeaks('liveness route', async () => {
    itLeaks('should succeed when bot is connected', async () => {
      const endpoint = await createEndpoint(true, true);
      const status = spy();
      await endpoint.getLiveness(ineeda<Request>({}), ineeda<Response>({
        status,
      }));
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when bot is not connected', async () => {
      const endpoint = await createEndpoint(false, false);
      const status = spy();
      await endpoint.getLiveness(ineeda<Request>({}), ineeda<Response>({
        status,
      }));
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });

  describeLeaks('readiness route', async () => {
    itLeaks('should succeed when storage is connected', async () => {
      const endpoint = await createEndpoint(true, true);
      const status = spy();
      await endpoint.getReadiness(ineeda<Request>({}), ineeda<Response>({
        status,
      }));
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when storage is not connected', async () => {
      const endpoint = await createEndpoint(false, false);
      const status = spy();
      await endpoint.getReadiness(ineeda<Request>({}), ineeda<Response>({
        status,
      }));
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });
});

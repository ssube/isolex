import { expect } from 'chai';
import { Request, Response } from 'express';
import { ineeda } from 'ineeda';
import { spy, stub } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { GithubEndpoint } from '../../src/endpoint/GithubEndpoint';
import { STATUS_SUCCESS } from '../../src/endpoint/HealthEndpoint';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

async function createEndpoint(botReady: boolean, storageReady: boolean): Promise<GithubEndpoint> {
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
  return createService(container, GithubEndpoint, {
    [INJECT_BOT]: bot,
    [INJECT_STORAGE]: storage,
    data: {
      filters: [],
      secret: '',
      strict: false,
    },
    metadata: {
      kind: 'github-endpoint',
      name: 'test-endpoint',
    },
  });
}

// tslint:disable:no-identical-functions
describeLeaks('github endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/github');
  });

  itLeaks('should have a router', async () => {
    const endpoint = await createEndpoint(false, false);
    const router = await endpoint.createRouter();
    expect(router).to.be.an.instanceOf(Function);
  });

  describeLeaks('webhook route', async () => {
    const endpoint = await createEndpoint(false, false);
    const sendStatus = spy();
    await endpoint.postWebhook(ineeda<Request>({
      header: stub().returns([]),
    }), ineeda<Response>({
      sendStatus,
    }));
    expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
  });
});

import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy, stub } from 'sinon';

import { STATUS_SUCCESS } from '../../src/endpoint/BaseEndpoint';
import { GithubEndpoint, GithubEndpointData } from '../../src/endpoint/GithubEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { createEndpoint } from '../helpers/request';

const TEST_DATA: GithubEndpointData = {
  defaultCommand: {
    data: {},
    labels: {},
    noun: 'test',
    verb: CommandVerb.Get,
  },
  filters: [],
  hookUser: '',
  secret: '',
  strict: false,
  transforms: [],
};

// tslint:disable:no-identical-functions
describe('github endpoint', async () => {
  it('should have paths', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);

    const EXPECTED_ENDPOINTS = 3;
    expect(endpoint.paths.length).to.equal(EXPECTED_ENDPOINTS);
    expect(endpoint.paths).to.include('/github');
  });

  it('should configure a router', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);
    await endpoint.start();

    const post = spy();
    const router = ineeda<Router>({
      post,
    });
    const result = await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
      router,
    });

    expect(result).to.equal(router, 'must return the passed router');
    expect(post).to.have.callCount(1);
  });

  describe('webhook route', async () => {
    it('should succeed on unknown hooks', async () => {
      const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);
      await endpoint.start();

      const sendStatus = spy();
      await endpoint.postWebhook(ineeda<Request>({
        header: stub().returns([]),
      }), ineeda<Response>({
        sendStatus,
      }));

      expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    it('should handle pull review hooks', async () => {
      const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);
      await endpoint.start();

      const sendStatus = spy();
      await endpoint.postWebhook(ineeda<Request>({
        header: stub().withArgs('X-GitHub-Event').returns('pull_request_review'),
      }), ineeda<Response>({
        sendStatus,
      }));

      expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    it('should handle commit status hooks', async () => {
      const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);
      await endpoint.start();

      const sendStatus = spy();
      await endpoint.postWebhook(ineeda<Request>({
        header: stub().withArgs('X-GitHub-Event').returns('status'),
      }), ineeda<Response>({
        sendStatus,
      }));

      expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });
  });
});

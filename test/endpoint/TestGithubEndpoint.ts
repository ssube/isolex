import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy, stub } from 'sinon';

import { GithubEndpoint } from '../../src/endpoint/GithubEndpoint';
import { STATUS_SUCCESS } from '../../src/endpoint/HealthEndpoint';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint } from '../helpers/request';

// tslint:disable:no-identical-functions
describeLeaks('github endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, {
      secret: '',
    });
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/github');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, {
      secret: '',
    });
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

  describeLeaks('webhook route', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, {
      secret: '',
    });
    const sendStatus = spy();
    await endpoint.postWebhook(ineeda<Request>({
      header: stub().returns([]),
    }), ineeda<Response>({
      sendStatus,
    }));
    expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
  });
});

import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy, stub } from 'sinon';

import { STATUS_SUCCESS } from '../../src/endpoint/BaseEndpoint';
import { GithubEndpoint } from '../../src/endpoint/GithubEndpoint';
import { GitlabEndpointData } from '../../src/endpoint/GitlabEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint } from '../helpers/request';

const TEST_DATA: GitlabEndpointData = {
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
};

// tslint:disable:no-identical-functions
describeLeaks('github endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(GithubEndpoint, false, false, TEST_DATA);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/github');
  });

  itLeaks('should configure a router', async () => {
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

  describeLeaks('webhook route', async () => {
    itLeaks('should succeed on unknown hooks', async () => {
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

    itLeaks('should handle pull review hooks', async () => {
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

    itLeaks('should handle commit status hooks', async () => {
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

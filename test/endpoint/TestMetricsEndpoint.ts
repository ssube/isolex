import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { match, spy } from 'sinon';

import { MetricsEndpoint } from '../../src/endpoint/MetricsEndpoint';
import { createEndpoint } from '../helpers/request';

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
describe('metrics endpoint', async () => {
  it('should have paths', async () => {
    const endpoint = await createEndpoint(MetricsEndpoint, false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/metrics');
  });

  it('should configure a router', async () => {
    const endpoint = await createEndpoint(MetricsEndpoint, false, false);
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

  describe('index route', async () => {
    it('should return metrics', async () => {
      const endpoint = await createEndpoint(MetricsEndpoint, true, true);
      const { end, response } = createRequest();
      await endpoint.getIndex(ineeda<Request>({}), response);
      expect(end).to.have.been.calledOnce.and.calledWithMatch(match.string);
    });
  });
});

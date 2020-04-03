import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';

import { STATUS_ERROR, STATUS_SUCCESS } from '../../src/endpoint/BaseEndpoint';
import { HealthEndpoint } from '../../src/endpoint/HealthEndpoint';
import { createEndpoint } from '../helpers/request';

function createRequest() {
  const status = spy();
  const response = ineeda<Response>({
    sendStatus: status,
  });
  return { response, status };
}

// tslint:disable:no-identical-functions
describe('health endpoint', async () => {
  it('should have paths', async () => {
    const endpoint = await createEndpoint(HealthEndpoint, false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/health');
  });

  it('should configure a router', async () => {
    const endpoint = await createEndpoint(HealthEndpoint, false, false);
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

  describe('liveness route', async () => {
    it('should succeed when bot is connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, true, true);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    it('should fail when bot is not connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, false, false);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });

  describe('readiness route', async () => {
    it('should succeed when storage is connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, true, true);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    it('should fail when storage is not connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, false, false);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });
});

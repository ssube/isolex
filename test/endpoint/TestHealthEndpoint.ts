import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';

import { HealthEndpoint, STATUS_ERROR, STATUS_SUCCESS } from '../../src/endpoint/HealthEndpoint';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint } from '../helpers/request';

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
    const endpoint = await createEndpoint(HealthEndpoint, false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/health');
  });

  itLeaks('should configure a router', async () => {
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

  describeLeaks('liveness route', async () => {
    itLeaks('should succeed when bot is connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, true, true);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when bot is not connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, false, false);
      const { response, status } = createRequest();
      await endpoint.getLiveness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });

  describeLeaks('readiness route', async () => {
    itLeaks('should succeed when storage is connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, true, true);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
    });

    itLeaks('should fail when storage is not connected', async () => {
      const endpoint = await createEndpoint(HealthEndpoint, false, false);
      const { response, status } = createRequest();
      await endpoint.getReadiness(ineeda<Request>({}), response);
      expect(status).to.have.been.calledOnce.and.calledWithExactly(STATUS_ERROR);
    });
  });
});

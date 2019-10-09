import { expect } from 'chai';
import { NextFunction, Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { match, spy } from 'sinon';

import { DebugEndpoint } from '../../src/endpoint/DebugEndpoint';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint, createRequest } from '../helpers/request';

// tslint:disable:no-identical-functions
describeLeaks('debug endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(DebugEndpoint, false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/debug');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(DebugEndpoint, false, false);
    const get = spy();
    const router = ineeda<Router>({
      get,
    });
    const result = await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>({
        authenticate(method: string) {
          return (req: Request, res: Response, next: NextFunction) => {
            next();
          };
        },
      }),
      router,
    });
    expect(result).to.equal(router, 'must return the passed router');
    expect(get).to.have.callCount(1);
  });

  describeLeaks('index route', async () => {
    itLeaks('should return services', async () => {
      const endpoint = await createEndpoint(DebugEndpoint, true, true);
      const { json, response } = createRequest();
      await endpoint.getIndex(ineeda<Request>({}), response);
      expect(json).to.have.been.calledOnce.and.calledWithMatch(match.array);
    });
  });
});

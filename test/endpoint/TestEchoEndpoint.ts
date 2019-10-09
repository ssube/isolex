import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';

import { EchoEndpoint } from '../../src/endpoint/EchoEndpoint';
import { User } from '../../src/entity/auth/User';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint } from '../helpers/request';

// tslint:disable:no-identical-functions
describeLeaks('echo endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(EchoEndpoint, false, false);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/echo');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(EchoEndpoint, false, false);
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

  describeLeaks('index route', async () => {
    itLeaks('should print default message without user', async () => {
      const endpoint = await createEndpoint(EchoEndpoint, true, true);
      const send = spy();
      await endpoint.getIndex(ineeda<Request>({
        get user(): User | undefined {
          return undefined;
        },
        set user(val: User | undefined) { /* noop */ }
      }), ineeda<Response>({
        send,
      }));
      expect(send).to.have.been.calledOnce.and.calledWithExactly('Hello World!');
    });

    itLeaks('should print personal message with user', async () => {
      const endpoint = await createEndpoint(EchoEndpoint, true, true);
      const send = spy();
      await endpoint.getIndex(ineeda<Request>({
        user: ineeda<User>({
          name: 'Bob',
        }),
      }), ineeda<Response>({
        send,
      }));
      expect(send).to.have.been.calledOnce.and.calledWithExactly('Hello Bob!');
    });
  });
});

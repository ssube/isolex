import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy, stub } from 'sinon';

import { STATUS_SUCCESS, STATUS_UNKNOWN } from '../../src/endpoint/BaseEndpoint';
import { GitlabEndpoint, GitlabEndpointData } from '../../src/endpoint/GitlabEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createEndpoint } from '../helpers/request';

const TEST_DATA: GitlabEndpointData = {
  defaultCommand: {
    data: {},
    labels: {},
    noun: '',
    verb: CommandVerb.Create,
  },
  filters: [],
  hookUser: '',
  strict: false,
};

const TEST_EVENTS = [{
  data: {},
  name: 'issue',
}, {
  data: {},
  name: 'job',
}, {
  data: {},
  name: 'note',
}, {
  data: {},
  name: 'pipeline',
}, {
  data: {},
  name: 'push',
}];

describeLeaks('gitlab endpoint', async () => {
  itLeaks('should have paths', async () => {
    const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);
    expect(endpoint.paths.length).to.equal(3);
    expect(endpoint.paths).to.include('/gitlab');
  });

  itLeaks('should configure a router', async () => {
    const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);
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
    itLeaks('should fail without a body', async () => {
      const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);
      const sendStatus = spy();
      await endpoint.postHook(ineeda<Request>({
        header: stub().returns([]),
      }), ineeda<Response>({
        sendStatus,
      }));
      expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_UNKNOWN);
    });

    for (const eventData of TEST_EVENTS) {
      itLeaks(`should succeed on ${eventData.name} events`, async () => {
        const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);
        await endpoint.start();
        const sendStatus = spy();
        await endpoint.postHook(ineeda<Request>({
          body: {
            ...eventData.data,
            object_kind: eventData.name,
          // tslint:disable-next-line:no-any
          } as any,
        }), ineeda<Response>({
          sendStatus,
        }));
        expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
      });
    }
  });
});

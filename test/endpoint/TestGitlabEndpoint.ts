import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy, stub } from 'sinon';

import { STATUS_SUCCESS, STATUS_UNKNOWN } from '../../src/endpoint/BaseEndpoint';
import { GitlabEndpoint, GitlabEndpointData } from '../../src/endpoint/GitlabEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { createEndpoint } from '../helpers/request';

/* eslint-disable @typescript-eslint/naming-convention */

const TEST_DATA: GitlabEndpointData = {
  defaultCommand: {
    data: {},
    labels: {},
    noun: '',
    verb: CommandVerb.Create,
  },
  filters: [],
  hookUser: 'test',
  strict: false,
  transforms: [],
};

const TEST_EVENTS = [{
  data: {},
  name: 'build',
}, {
  data: {},
  name: 'issue',
}, {
  data: {},
  name: 'note',
}, {
  data: {
    user: {
      name: 'test',
      username: 'test',
    },
  },
  name: 'pipeline',
}, {
  data: {
    /* eslint-disable camelcase */
    user_name: 'test',
    user_username: 'test',
  },
  name: 'push',
}];

describe('gitlab endpoint', async () => {
  it('should have paths', async () => {
    const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);

    const EXPECTED_CALLS = 3;
    expect(endpoint.paths.length).to.equal(EXPECTED_CALLS);
    expect(endpoint.paths).to.include('/gitlab');
  });

  it('should configure a router', async () => {
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

  describe('webhook route', async () => {
    it('should fail without a body', async () => {
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
      it(`should succeed on ${eventData.name} events`, async () => {
        const endpoint = await createEndpoint(GitlabEndpoint, false, false, TEST_DATA);
        await endpoint.start();
        const sendStatus = spy();
        await endpoint.postHook(ineeda<Request>({
          body: {
            ...eventData.data,
            // eslint-disable-next-line camelcase
            object_kind: eventData.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        }), ineeda<Response>({
          sendStatus,
        }));
        expect(sendStatus).to.have.been.calledOnce.and.calledWithExactly(STATUS_SUCCESS);
      });
    }
  });
});

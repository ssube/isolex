import { expect } from 'chai';
import { Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { spy } from 'sinon';

import { GraphEndpoint } from '../../src/endpoint/GraphEndpoint';
import { GraphSchemaData } from '../../src/schema/graph';
import { ServiceDefinition } from '../../src/Service';
import { createEndpoint } from '../helpers/request';

const TEST_SCHEMA: ServiceDefinition<GraphSchemaData> = {
  data: {
    filters: [],
    strict: true,
  },
  metadata: {
    kind: 'graph-schema',
    name: 'test-graph-schema',
  },
};

// tslint:disable:no-identical-functions
describe('graph endpoint', async () => {
  it('should have paths', async () => {
    const endpoint = await createEndpoint(GraphEndpoint, false, false, {
      graph: TEST_SCHEMA,
      graphiql: true,
    });

    const EXPECTED_ENDPOINTS = 3;
    expect(endpoint.paths.length).to.equal(EXPECTED_ENDPOINTS);
    expect(endpoint.paths).to.include('/graph');
  });

  it('should configure a router', async () => {
    const endpoint = await createEndpoint(GraphEndpoint, false, false, {
      graph: TEST_SCHEMA,
      graphiql: true,
    });
    const use = spy();
    const router = ineeda<Router>({
      use,
    });
    await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
      router,
    });
    expect(use).to.have.callCount(1);
  });
});

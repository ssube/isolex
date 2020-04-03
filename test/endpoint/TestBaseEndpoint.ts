import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import passport from 'passport';
import { match, spy } from 'sinon';

import { EndpointData, Handler } from '../../src/endpoint';
import { BaseEndpoint, BaseEndpointOptions } from '../../src/endpoint/BaseEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { createService, createServiceContainer } from '../helpers/container';

describe('base endpoint', async () => {
  it('should bind handler methods', async () => {
    class SubEndpoint extends BaseEndpoint<EndpointData> {
      constructor(options: BaseEndpointOptions<EndpointData>) {
        super(options, 'isolex#/definitions/service-endpoint');
      }

      @Handler(CommandVerb.Get, '/test')
      public async getTest(req: Request, res: Response) {
        /* noop */
      }
    }

    const { container } = await createServiceContainer();
    const endpoint = await createService(container, SubEndpoint, {
      data: {
        filters: [],
        strict: false,
        transforms: [],
      },
      metadata: {
        kind: 'sub-endpoint',
        name: 'test-endpoint',
      },
    });

    const get = spy();
    await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
      router: ineeda<Router>({
        get,
      }),
    });

    expect(get).to.have.been.calledOnce.and.calledWithExactly('/test', match.func);
  });

  it('should create a router if one is not provided', async () => {
    class SubEndpoint extends BaseEndpoint<EndpointData> {
      constructor(options: BaseEndpointOptions<EndpointData>) {
        super(options, 'isolex#/definitions/service-endpoint');
      }
    }

    const { container } = await createServiceContainer();
    const endpoint = await createService(container, SubEndpoint, {
      data: {
        filters: [],
        strict: false,
        transforms: [],
      },
      metadata: {
        kind: 'sub-endpoint',
        name: 'test-endpoint',
      },
    });
    const router = await endpoint.createRouter({
      passport: ineeda<passport.Authenticator>(),
    });
    expect(router).to.be.an.instanceOf(Function);
  });
});

import { expect } from 'chai';
import { Request, Response, Router } from 'express';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { EndpointData, Handler } from '../../src/endpoint';
import { BaseEndpoint } from '../../src/endpoint/BaseEndpoint';
import { CommandVerb } from '../../src/entity/Command';
import { BaseListenerOptions } from '../../src/listener/BaseListener';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('base endpoint', async () => {
  itLeaks('should bind handler methods', async () => {
    class SubEndpoint extends BaseEndpoint<EndpointData> {
      constructor(options: BaseListenerOptions<EndpointData>) {
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
      },
      metadata: {
        kind: 'sub-endpoint',
        name: 'test-endpoint',
      }
    });

    const get = spy();
    await endpoint.createRouter(ineeda<Router>({
      get,
    }));

    expect(get).to.have.been.calledOnce.and.calledWithExactly('/test', match.func);
  });
});

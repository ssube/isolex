import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { EventInterval } from '../../src/interval/EventInterval';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('event interval', async () => {
  itLeaks('should notify target services', async () => {
    const { container } = await createServiceContainer();
    const interval = await createService(container, EventInterval, {
      data: {
        defaultContext: {
          channel: {
            id: '',
            thread: '',
          },
          name: '',
          uid: '',
        },
        defaultTarget: {
          kind: 'test-service',
          name: 'test-target',
        },
        filters: [],
        frequency: {
          time: '30s',
        },
        services: [],
        strict: false,
      },
      metadata: {
        kind: 'event-endpoint',
        name: 'test-endpoint'
      },
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>({}));
    expect(status).to.equal(0);
  });
});

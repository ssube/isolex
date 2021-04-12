import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { EventGenerator } from '../../src/generator/EventGenerator';
import { Service } from '../../src/Service';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestContextData } from '../helpers/context';

const TEST_SVC = 'some-service';

describe('event generator', async () => {
  it('should notify target services', async () => {
    const notify = spy();
    const { container, services } = await createServiceContainer();
    services.addService(ineeda<Service>({
      kind: TEST_SVC,
      name: TEST_SVC,
      notify,
    }));
    const interval = await createService(container, EventGenerator, {
      data: {
        context: getTestContextData(),
        filters: [],
        frequency: {
          time: '30s',
        },
        redirect: {
          defaults: {},
          forces: {
            target: {
              kind: 'test-service',
              name: 'test-target',
            },
          },
        },
        services: [{
          kind: TEST_SVC,
          name: TEST_SVC,
        }],
        strict: false,
      },
      metadata: {
        kind: 'event-endpoint',
        name: 'test-endpoint'
      },
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>({}));
    expect(status).to.equal(0);
    expect(notify).to.have.callCount(1);
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { MetricsInterval } from '../../src/interval/MetricsInterval';
import { defer } from '../../src/utils/Async';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_TARGET = 'test-target';
const TEST_INTERVAL = 'metrics-interval';

describeLeaks('metrics interval', async () => {
  itLeaks('should succeed each tick', async () => {
    const { container } = await createServiceContainer();
    const interval = await createService(container, MetricsInterval, {
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
          kind: TEST_TARGET,
          name: TEST_TARGET,
        },
        filters: [],
        frequency: {
          time: '100ms',
        },
        strict: false,
      },
      metadata: {
        kind: TEST_INTERVAL,
        name: TEST_INTERVAL,
      }
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>(), ineeda<Tick>());
    expect(status).to.equal(0);
  });

  itLeaks('should collect default metrics', async () => {
    const { container } = await createServiceContainer();
    const collector = spy();
    const interval = await createService(container, MetricsInterval, {
      collector,
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
          kind: TEST_TARGET,
          name: TEST_TARGET,
        },
        filters: [],
        frequency: {
          time: '10ms',
        },
        strict: false,
      },
      metadata: {
        kind: TEST_INTERVAL,
        name: TEST_INTERVAL,
      }
    });
    await interval.startInterval();
    await defer(50);
    expect(collector).to.have.been.calledWithMatch(match.has('register'));
    expect(collector).to.have.been.calledWithMatch(match.has('timeout'));
  });
});

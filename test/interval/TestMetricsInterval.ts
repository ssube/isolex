import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { InvalidArgumentError } from '../../src/error/InvalidArgumentError';
import { MetricsInterval, MetricsIntervalData } from '../../src/interval/MetricsInterval';
import { defer } from '../../src/utils/Async';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_TARGET = 'test-target';
const TEST_INTERVAL = 'metrics-interval';
const TEST_DATA: MetricsIntervalData = {
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
};
const TEST_METADATA = {
  kind: TEST_INTERVAL,
  name: TEST_INTERVAL,
};

describeLeaks('metrics interval', async () => {
  itLeaks('should succeed each tick', async () => {
    const { container } = await createServiceContainer();
    const interval = await createService(container, MetricsInterval, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>(), ineeda<Tick>());
    expect(status).to.equal(0);
  });

  itLeaks('should collect default metrics', async () => {
    const { container } = await createServiceContainer();
    const collector = spy();
    const interval = await createService(container, MetricsInterval, {
      collector,
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    await interval.startInterval();
    await defer(50);
    expect(collector).to.have.been.calledWithMatch(match.has('register'));
    expect(collector).to.have.been.calledWithMatch(match.has('timeout'));
  });

  itLeaks('must have a frequency', async () => {
    const { container } = await createServiceContainer();
    const interval = await createService(container, MetricsInterval, {
      data: {
        ...TEST_DATA,
        frequency: {
          cron: '* * * * *',
        },
      },
      metadata: TEST_METADATA,
    });
    expect(interval.startInterval()).to.eventually.be.rejectedWith(InvalidArgumentError);
  });
});

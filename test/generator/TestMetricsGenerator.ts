import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { INJECT_CLOCK } from '../../src/BaseService';
import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { InvalidArgumentError } from '../../src/error/InvalidArgumentError';
import { MetricsGenerator, MetricsGeneratorData } from '../../src/generator/MetricsGenerator';
import { defer } from '../../src/utils/Async';
import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_TARGET = 'test-target';
const TEST_GENERATOR = 'metrics-generator';
const TEST_DATA: MetricsGeneratorData = {
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
  kind: TEST_GENERATOR,
  name: TEST_GENERATOR,
};

describeLeaks('metrics generator', async () => {
  itLeaks('should succeed each tick', async () => {
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_CLOCK).toInstance(await container.create(Clock, {}));

    const interval = await createService(container, MetricsGenerator, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>(), ineeda<Tick>());
    expect(status).to.equal(0);
  });

  itLeaks('should collect default metrics', async () => {
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_CLOCK).toInstance(await container.create(Clock, {}));

    const collector = spy();
    const interval = await createService(container, MetricsGenerator, {
      collector,
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    await interval.start();
    await defer(50);
    await interval.stop();

    expect(collector).to.have.been.calledWithMatch(match.has('register'));
    expect(collector).to.have.been.calledWithMatch(match.has('timeout'));
  });

  itLeaks('must have a frequency', async () => {
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_CLOCK).toInstance(await container.create(Clock, {}));

    const interval = await createService(container, MetricsGenerator, {
      data: {
        ...TEST_DATA,
        frequency: {
          cron: '* * * * *',
        },
      },
      metadata: TEST_METADATA,
    });

    return expect(interval.start()).to.eventually.be.rejectedWith(InvalidArgumentError);
  });
});

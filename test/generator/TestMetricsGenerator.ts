import { defer, InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { INJECT_CLOCK } from '../../src/BaseService';
import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { MetricsGenerator, MetricsGeneratorData } from '../../src/generator/MetricsGenerator';
import { Clock } from '../../src/utils/Clock';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_DELAY = 50;
const TEST_TARGET = 'test-target';
const TEST_GENERATOR = 'metrics-generator';
const TEST_DATA: MetricsGeneratorData = {
  context: {
    channel: {
      id: '',
      thread: '',
    },
    name: '',
    uid: '',
  },
  filters: [],
  frequency: {
    time: '100ms',
  },
  redirect: {
    defaults: {},
    forces: {
      target: {
        service: {
          kind: TEST_TARGET,
          name: TEST_TARGET,
        },
        source: false,
      },
    }
  },
  strict: false,
  timeout: '100ms',
};
const TEST_METADATA = {
  kind: TEST_GENERATOR,
  name: TEST_GENERATOR,
};

describe('metrics generator', async () => {
  it('should succeed each tick', async () => {
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_CLOCK).toInstance(await container.create(Clock, {}));

    const interval = await createService(container, MetricsGenerator, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>(), ineeda<Tick>());
    expect(status).to.equal(0);
  });

  it('should collect default metrics', async () => {
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_CLOCK).toInstance(await container.create(Clock, {}));

    const collector = spy();
    const interval = await createService(container, MetricsGenerator, {
      collector,
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    await interval.start();
    await defer(TEST_DELAY);
    await interval.stop();

    expect(collector).to.have.been.calledWithMatch(match.has('register'));
    expect(collector).to.have.been.calledWithMatch(match.has('timeout'));
  });

  it('must have a frequency', async () => {
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

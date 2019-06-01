import { expect } from 'chai';

import { TimeController } from 'src/controller/TimeController';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createService, createServiceContainer } from 'test/helpers/container';

describeAsync('time controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, TimeController, {
      data: {
        filters: [],
        locale: 'en-US',
        strict: true,
        transforms: [],
        zone: 'UTC',
      },
      metadata: {
        kind: 'time-controller',
        name: 'test_time',
      },
    });
    expect(controller).to.be.an.instanceOf(TimeController);
  });
});

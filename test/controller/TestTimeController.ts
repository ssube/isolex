import { expect } from 'chai';

import { TimeController } from '../../src/controller/TimeController';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('time controller', async () => {
  itLeaks('should exist', async () => {
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

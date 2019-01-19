import { expect } from 'chai';

import { TimeController } from 'src/controller/TimeController';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('time controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

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

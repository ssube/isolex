import { expect } from 'chai';

import { TimeController } from '../../src/controller/TimeController';
import { createService, createServiceContainer } from '../helpers/container';

describe('time controller', async () => {
  it('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, TimeController, {
      data: {
        filters: [],
        locale: 'en-US',
        redirect: {
          defaults: {},
          forces: {},
        },
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

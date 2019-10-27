import { expect } from 'chai';

import { RandomController } from '../../src/controller/RandomController';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('random controller', async () => {
  itLeaks('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, RandomController, {
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {},
        },
        strict: true,
        transforms: [],
      },
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
    });
    expect(controller).to.be.an.instanceOf(RandomController);
  });
});

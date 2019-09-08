import { expect } from 'chai';

import { RandomController } from '../../src/controller/RandomController';
import { describeAsync, itAsync } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeAsync('random controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, RandomController, {
      data: {
        filters: [],
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

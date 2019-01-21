import { expect } from 'chai';

import { RandomController } from 'src/controller/RandomController';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('random controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

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

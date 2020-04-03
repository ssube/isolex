import { expect } from 'chai';

import { RandomController } from '../../src/controller/RandomController';
import { createService, createServiceContainer } from '../helpers/container';

describe('random controller', async () => {
  it('should exist', async () => {
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

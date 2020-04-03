import { expect } from 'chai';

import { CompletionController } from '../../src/controller/CompletionController';
import { createService, createServiceContainer } from '../helpers/container';

describe('completion controller', async () => {
  it('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, CompletionController, {
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
        kind: 'completion-controller',
        name: 'test_completion',
      },
    });
    expect(controller).to.be.an.instanceOf(CompletionController);
  });
});

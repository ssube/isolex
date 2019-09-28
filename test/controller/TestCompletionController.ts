import { expect } from 'chai';

import { CompletionController } from '../../src/controller/CompletionController';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('completion controller', async () => {
  itLeaks('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, CompletionController, {
      data: {
        defaultTarget: {
          kind: '',
          name: '',
        },
        filters: [],
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

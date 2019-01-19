import { expect } from 'chai';

import { CompletionController } from 'src/controller/CompletionController';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('completion controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

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

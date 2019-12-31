import { expect } from 'chai';

import { Command, CommandOptions, CommandVerb } from '../../src/entity/Command';
import { ServiceMetadata } from '../../src/Service';
import { ShellTransform } from '../../src/transform/ShellTransform';
import { TYPE_JSON } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer, createService } from '../helpers/container';
import { ServiceModule } from '../../src/module/ServiceModule';

const TEST_METADATA: ServiceMetadata = {
  kind: 'test-transform',
  name: 'test-transform',
};

const TEST_COMMAND: CommandOptions = {
  data: {},
  labels: {},
  noun: 'test',
  verb: CommandVerb.Get,
};

const CHILD_TIMEOUT = 150;

describeLeaks('shell transform', async () => {
  itLeaks('should write merged value and scope to child', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }));
    const transform = await createService(container, ShellTransform, {
      data: {
        child: {
          args: ['-'],
          command: '/bin/cat',
          cwd: '',
          env: [],
          timeout: CHILD_TIMEOUT,
        },
        filters: [],
        strict: false,
      },
      metadata: TEST_METADATA,
    });

    const value = new Command(TEST_COMMAND);
    const scope = {};

    const result = await transform.transform(value, TYPE_JSON, scope);
    expect(result).to.deep.equal({
      scope,
      value: value.toJSON(),
    });
  });

  itLeaks('should parse output from child', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }));
    const transform = await createService(container, ShellTransform, {
      data: {
        child: {
          // TODO: use a mock spawn rather than an inline shell script
          args: ['-c', 'cat - > /dev/null; echo \'{"test": "hello world!"}\''],
          command: '/bin/sh',
          cwd: '',
          env: [],
          timeout: CHILD_TIMEOUT,
        },
        filters: [],
        strict: false,
      },
      metadata: TEST_METADATA,
    });

    const value = new Command(TEST_COMMAND);
    const scope = {};

    const result = await transform.transform(value, TYPE_JSON, scope);
    expect(result).to.deep.equal({
      test: 'hello world!',
    });
  });
});

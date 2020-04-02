import { expect } from 'chai';
import { stub } from 'sinon';

import { Command, CommandOptions, CommandVerb } from '../../src/entity/Command';
import { ServiceModule } from '../../src/module/ServiceModule';
import { ServiceMetadata } from '../../src/Service';
import { ShellTransform } from '../../src/transform/ShellTransform';
import { TYPE_JSON } from '../../src/utils/Mime';
import { createChild } from '../helpers/child';
import { createContainer, createService } from '../helpers/container';

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

describe('shell transform', async () => {
  it('should write merged value and scope to child', async () => {
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

  it('should parse output from child', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 0,
    }));

    const { child } = createChild(0, undefined, Buffer.from('{"test": "hello world!"}'));
    const exec = stub().returns(child);
    const transform = await createService(container, ShellTransform, {
      data: {
        child: {
          args: [],
          command: 'no',
          cwd: '',
          env: [],
          timeout: CHILD_TIMEOUT,
        },
        filters: [],
        strict: false,
      },
      exec,
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

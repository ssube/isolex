import { expect } from 'chai';

import { INJECT_JSONPATH } from '../../src/BaseService';
import { Command, CommandVerb } from '../../src/entity/Command';
import { FlattenTransform } from '../../src/transform/FlattenTransform';
import { JsonPath } from '../../src/utils/JsonPath';
import { TYPE_JSON } from '../../src/utils/Mime';
import { createService, createServiceContainer } from '../helpers/container';

const OUTPUT_FIELD = 'body';

describe('flatten transform', async () => {
  it('should transform data', async () => {
    const { container } = await createServiceContainer();

    const data = {
      bar: ['world'],
      foo: ['hello'],
    };
    const transform = await createService(container, FlattenTransform, {
      data: {
        deep: true,
        filters: [],
        join: '-',
        keys: ['$.foo', '$.bar'],
        strict: true,
      },
      [INJECT_JSONPATH]: new JsonPath(),
      metadata: {
        kind: 'flatten-transform',
        name: 'test_transform',
      },
    });

    const cmd = new Command({
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    });
    const output = await transform.transform(cmd, TYPE_JSON, data);
    expect(output[OUTPUT_FIELD]).to.deep.equal(['hello-world']);
  });
});

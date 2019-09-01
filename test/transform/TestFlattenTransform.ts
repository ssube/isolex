import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { INJECT_JSONPATH } from 'src/BaseService';
import { Command } from 'src/entity/Command';
import { FlattenTransform } from 'src/transform/FlattenTransform';
import { JsonPath } from 'src/utils/JsonPath';
import { TYPE_JSON } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createService, createServiceContainer } from 'test/helpers/container';
import { makeMap } from 'src/utils/Map';

describeAsync('flatten transform', async () => {
  itAsync('should transform data', async () => {
    const { container } = await createServiceContainer();

    const data = {
      foo: ['hello'],
      bar: ['world'],
    };
    const transform = await createService(container, FlattenTransform, {
      data: {
        deep: true,
        filters: [],
        join: '-',
        keys: ['$.data.foo', '$.data.bar'],
        strict: true,
      },
      [INJECT_JSONPATH]: new JsonPath(),
      metadata: {
        kind: 'flatten-transform',
        name: 'test_transform',
      },
    });

    const output = await transform.transform(ineeda.instanceof(Command, {
      data: makeMap(data),
    }), TYPE_JSON, data);
    expect(output).to.equal('hello-world');
  });
});

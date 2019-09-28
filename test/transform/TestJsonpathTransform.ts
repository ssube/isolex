import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { INJECT_JSONPATH } from '../../src/BaseService';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { JsonpathTransform } from '../../src/transform/JsonpathTransform';
import { JsonPath } from '../../src/utils/JsonPath';
import { TYPE_JSON } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('jsonpath transform', async () => {
  itLeaks('should transform data', async () => {
    const { container } = await createServiceContainer();

    const data = { test: ['test_body'] };
    const queries = {
      test: '$.test[*]',
    };

    const transform = await createService(container, JsonpathTransform, {
      data: {
        filters: [],
        queries,
        strict: true,
      },
      [INJECT_JSONPATH]: new JsonPath(),
      metadata: {
        kind: 'jsonpath-transform',
        name: 'test_transform',
      },
    });
    const output = await transform.transform(new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Get,
    }), TYPE_JSON, data);

    expect(output).to.deep.equal(data);
  });
});

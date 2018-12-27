import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { JsonpathTransform } from 'src/transform/JsonpathTransform';
import { JsonPath } from 'src/utils/JsonPath';
import { TYPE_JSON } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('jsonpath transform', async () => {
  itAsync('should transform data', async () => {
    const { container } = await createContainer();

    const data = { test: ['test_body'] };
    const queries = {
      test: '$.data.test[*]',
    };

    const transform = await createService(container, JsonpathTransform, {
      data: {
        filters: [],
        queries,
        strict: true,
      },
      jsonpath: new JsonPath(),
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
    }), Message.reply(ineeda<Context>(), TYPE_JSON, JSON.stringify(data)));

    expect(output.length).to.equal(1);
    const parsed = JSON.parse(output[0].body);
    expect(parsed).to.deep.equal(data);
  });
});

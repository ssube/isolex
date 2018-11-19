import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';

import { Bot } from 'src/Bot';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { JsonpathTransform, JsonpathTransformOptions } from 'src/transform/JsonpathTransform';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('jsonpath transform', async () => {
  itAsync('should transform data', async () => {
    const { container } = await createContainer();

    const data = { test: ['test_body'] };
    const queries = {
      test: '$.data.test[*]',
    };

    const options: JsonpathTransformOptions = {
      bot: ineeda<Bot>(),
      container,
      data: {
        parsers: [],
        queries,
      },
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'jsonpath-transform',
        name: 'test_transform',
      },
    };
    const transform = await container.create(JsonpathTransform, options);
    const output = await transform.transform(Command.create({
      context: ineeda<Context>(),
      data: {},
      noun: 'test',
      verb: CommandVerb.Get,
    }), data);

    expect(output.length).to.equal(1);
    expect((output[0].body as any).test).to.deep.equal(data.test);
  });
});

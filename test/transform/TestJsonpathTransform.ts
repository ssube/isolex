import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';
import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { JsonpathTransform, JsonpathTransformOptions } from 'src/transform/JsonpathTransform';
import { TYPE_JSON } from 'src/utils/Mime';

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
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
    };
    const transform = await container.create(JsonpathTransform, options);
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

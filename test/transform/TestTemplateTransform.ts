import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { TemplateTransform } from 'src/transform/TemplateTransform';
import { TYPE_JSON } from 'src/utils/Mime';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('template transform', async () => {
  itAsync('should transform data', async () => {
    const { container } = await createContainer();

    const data = {
      test: 1,
    };
    const templates = {
      body: 'test_body',
    };
    const transform = await createService(container, TemplateTransform, {
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => templates.body,
        }),
      }),
      data: {
        filters: [],
        templates,
      },
      metadata: {
        kind: 'template-transform',
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
    expect(parsed).to.deep.equal(templates);
  });
});

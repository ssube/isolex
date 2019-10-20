import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { INJECT_TEMPLATE } from '../../src/BaseService';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { TemplateTransform } from '../../src/transform/TemplateTransform';
import { TYPE_JSON } from '../../src/utils/Mime';
import { Template } from '../../src/utils/Template';
import { TemplateCompiler } from '../../src/utils/TemplateCompiler';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('template transform', async () => {
  itLeaks('should transform data', async () => {
    const { container } = await createServiceContainer();

    const data = {
      test: ['1'],
    };
    const templates = {
      body: 'test_body',
    };
    const transform = await createService(container, TemplateTransform, {
      [INJECT_TEMPLATE]: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => templates.body,
        }),
      }),
      data: {
        filters: [],
        strict: true,
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
    }), TYPE_JSON, data);

    expect(output).to.deep.equal({
      body: [templates.body],
    });
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Bot } from 'src/Bot';
import { NOUN_WEATHER, WeatherController } from 'src/controller/WeatherController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('weather controller', async () => {
  itAsync('should send a message', async () => {
    const { container, module } = await createContainer();
    const data = { test: 'test' };
    module.bind('request').toFactory(async () => data);

    const sent: Array<Message> = [];
    const bot = ineeda<Bot>({
      sendMessage: (msg: Message) => {
        sent.push(msg);
      },
    });
    module.bind('bot').toInstance(bot);

    const controller = await createService(container, WeatherController, {
      bot,
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => 'test',
        }),
      }),
      data: {
        api: {
          key: '0',
          root: 'https://api.openweathermap.org/data/2.5/',
        },
        filters: [],
        strict: true,
        transforms: [{
          data: {
            parsers: [],
            templates: {
              body: '{{ weather.test }}',
            },
          } as any, // @TODO: this should use a type that allows additional properties
          metadata: {
            kind: 'template-transform',
            name: 'test_weather',
          },
        }],
      },
      metadata: {
        kind: 'weather-controller',
        name: 'test_weather',
      },
    });
    expect(controller).to.be.an.instanceOf(WeatherController);

    const cmd = new Command({
      context: ineeda<Context>(),
      data: {
        location: ['94040'],
      },
      labels: {},
      noun: NOUN_WEATHER,
      verb: CommandVerb.Get,
    });

    expect(await controller.check(cmd)).to.equal(true);
    await controller.handle(cmd);

    expect(sent.length).to.equal(1);
    expect(sent[0]).to.be.an.instanceOf(Message);
    expect(sent[0].body).to.deep.equal(data);
  });
});

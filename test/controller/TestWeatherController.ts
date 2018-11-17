import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';

import { Bot } from 'src/Bot';
import { WeatherController, WeatherControllerOptions } from 'src/controller/WeatherController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('weather controller', async () => {
  itAsync('should send a message', async () => {
    const { container, module } = await createContainer();
    module.bind('request').toFactory(async () => ({ test: 'test' }));

    const sent: Array<Message> = [];
    const options: WeatherControllerOptions = {
      bot: ineeda<Bot>({
        send: (msg: Message) => {
          sent.push(msg);
        },
      }),
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
        template: '{{ weather.test }}',
      },
      container,
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'weather-controller',
        name: 'test_weather',
      }
    };
    const controller = await container.create(WeatherController, options);
    expect(controller).to.be.an.instanceOf(WeatherController);

    const context = Context.create({
      listenerId: '',
      roomId: '',
      threadId: '',
      userId: '',
      userName: '',
    });

    const cmd = Command.create({
      context,
      data: {
        location: ['94040'],
      },
      noun: 'test_weather',
      verb: CommandVerb.None,
    });

    expect(await controller.check(cmd)).to.equal(true);
    await controller.handle(cmd);

    expect(sent.length).to.equal(1);
    expect(sent[0].body).to.equal('test');
  });
});

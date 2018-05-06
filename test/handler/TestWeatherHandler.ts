import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { spy } from 'sinon';

import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { WeatherHandler, WeatherHandlerOptions } from 'src/handler/WeatherHandler';
import { Message } from 'src/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('weather handler', async () => {
  itAsync('should send a message', async () => {
    const { container } = await createContainer();

    let msg = Message.create({} as any);
    const options: WeatherHandlerOptions = {
      bot: ineeda<Bot>({
        send: (inMsg: Message) => {
          msg = inMsg;
        }
      }),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>()
      }),
      config: {
        api: {
          key: '0',
          root: 'https://api.openweathermap.org/data/2.5/'
        },
        name: 'test_weather',
        template: '{{ data.name }}'
      },
      container,
      logger: ConsoleLogger.global
    };
    const handler = await container.create(WeatherHandler, options);
    expect(handler).to.be.an.instanceOf(WeatherHandler);

    const handled = await handler.handle(Command.create({
      context: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      },
      data: {
        zip: 94040
      },
      name: 'test_weather',
      type: 0
    }));
    expect(handled).to.be.true;
    expect(msg.body).to.equal('unknown or missing location');
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { spy } from 'sinon';

import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { WeatherHandler, WeatherHandlerOptions } from 'src/handler/WeatherHandler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('weather handler', async () => {
  itAsync('should send a message', async () => {
    const { container } = await createContainer();

    let msg = Message.create({
      body: '',
      context: Context.create({
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      }),
      reactions: []
    });
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

    const context = Context.create({
      roomId: '',
      threadId: '',
      userId: '',
      userName: ''
    });

    const cmd = Command.create({
      context,
      data: {
        zip: 94040
      },
      name: 'test_weather',
      type: 0
    });

    expect(await handler.check(cmd)).to.be.true;
    await handler.handle(cmd);
    expect(msg.body).to.equal('unknown or missing location');
  });
});

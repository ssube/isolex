import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { INJECT_REQUEST } from '../../src/BaseService';
import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { NOUN_WEATHER, WeatherController } from '../../src/controller/WeatherController';
import { User } from '../../src/entity/auth/User';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { ServiceModule } from '../../src/module/ServiceModule';
import { TransformModule } from '../../src/module/TransformModule';
import { Transform } from '../../src/transform';
import { RequestFactory } from '../../src/utils/Request';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('weather controller', async () => {
  itLeaks('should send a message', async () => {
    const modules = [new ServiceModule({
      timeout: 100,
    }), new TransformModule()];
    const { container, module } = await createServiceContainer(...modules);

    const data = { test: 'test' };
    module.bind(INJECT_REQUEST).toInstance(ineeda<RequestFactory>({
      create: async () => data,
    }));

    const sent: Array<Message> = [];
    const bot = ineeda<Bot>({
      sendMessage: (msg: Message) => {
        sent.push(msg);
      },
    });
    module.bind(INJECT_BOT).toInstance(bot);
    module.bind('test-transform').toInstance(ineeda<Transform>({
      check: () => Promise.resolve(true),
      transform: (txCmd: Command, type: string, txData: typeof data) => Promise.resolve({
        body: [txData.test],
      }),
    }));

    const controller = await createService(container, WeatherController, {
      [INJECT_BOT]: bot,
      data: {
        api: {
          key: '0',
          root: 'https://api.openweathermap.org/data/2.5/',
        },
        filters: [],
        strict: true,
        transforms: [{
          data: {
            filters: [],
            strict: true,
          },
          metadata: {
            kind: 'test-transform',
            name: 'test_weather',
          },
        }],
      },
      metadata: {
        kind: 'weather-controller',
        name: 'test_weather',
      },
    });
    await controller.start();

    expect(controller).to.be.an.instanceOf(WeatherController);

    const cmd = new Command({
      context: ineeda<Context>({
        checkGrants: () => true,
        user: ineeda<User>(),
      }),
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
    expect(sent[0].body).to.deep.equal(data.test);
  });
});

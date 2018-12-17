import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';
import { Registry } from 'prom-client';
import { match, spy } from 'sinon';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { EchoController, EchoControllerOptions, NOUN_ECHO } from 'src/controller/EchoController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { Clock } from 'src/utils/Clock';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('echo controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

    const options: EchoControllerOptions = {
      bot: ineeda<Bot>(),
      clock: new Clock(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>(),
      }),
      container,
      data: {
        filters: [],
        transforms: [{
          data: {},
          metadata: {
            kind: 'template-transform',
            name: 'test_template',
          },
        }],
      },
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
    };
    const controller = await container.create(EchoController, options);
    expect(controller).to.be.an.instanceOf(EchoController);
  });

  itAsync('should handle commands', async () => {
    const { container } = await createContainer();

    const sendMessage = spy();
    const options: EchoControllerOptions = {
      bot: ineeda<Bot>({
        sendMessage,
      }),
      clock: new Clock(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => 'test_echo',
        }),
      }),
      container,
      data: {
        filters: [],
        transforms: [{
          data: {},
          metadata: {
            kind: 'template-transform',
            name: 'test_template',
          },
        }],
      },
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
     };
    const controller = await container.create(EchoController, options);

    const cmd = new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: NOUN_ECHO,
      verb: CommandVerb.Get,
    });

    expect(await controller.check(cmd)).to.equal(true);
    await controller.handle(cmd);
    expect(sendMessage).to.have.been.calledWithMatch(match.instanceOf(Message));
  });
});

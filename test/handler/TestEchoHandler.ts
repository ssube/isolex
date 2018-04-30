import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { match, spy } from 'sinon';

import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { EchoHandler, EchoHandlerOptions } from 'src/handler/EchoHandler';
import { Message } from 'src/Message';
import { Template } from 'src/util/Template';
import { TemplateCompiler } from 'src/util/TemplateCompiler';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('echo handler', async () => {
  itAsync('should exist', async () => {
    const container = Container.from();
    await container.configure();

    const options: EchoHandlerOptions = {
      bot: ineeda<Bot>(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>()
      }),
      config: {
        template: ''
      },
      container,
      logger: ConsoleLogger.global,
    };
    const handler = await container.create(EchoHandler, options);
    expect(handler).to.be.an.instanceOf(EchoHandler);
 
  });
  itAsync('should handle commands', async () => {
    const container = Container.from();
    await container.configure();

    const send = spy();
    const options: EchoHandlerOptions = {
      bot: ineeda<Bot>({
        send
      }),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>()
      }),
      config: {
        template: ''
      },
      container,
      logger: ConsoleLogger.global,
    };
    const handler = await container.create(EchoHandler, options);

    const cmd = new Command({
      data: {},
      from: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      },
      name: 'test_cmd',
      type: 0
    });
    const handled = await handler.handle(cmd);
    expect(handled).to.be.true;
    expect(send).to.have.been.calledWithMatch(match.instanceOf(Message));
  });
});

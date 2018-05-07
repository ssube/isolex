import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container, Module, Provides } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { match, spy } from 'sinon';

import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { EchoHandler, EchoHandlerOptions } from 'src/handler/EchoHandler';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('echo handler', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

    const options: EchoHandlerOptions = {
      bot: ineeda<Bot>(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>()
      }),
      config: {
        name: 'test_echo',
        template: ''
      },
      container,
      logger: ConsoleLogger.global
    };
    const handler = await container.create(EchoHandler, options);
    expect(handler).to.be.an.instanceOf(EchoHandler);
  });

  itAsync('should handle commands', async () => {
    const { container } = await createContainer();

    const send = spy();
    const options: EchoHandlerOptions = {
      bot: ineeda<Bot>({
        send
      }),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => 'test_echo'
        })
      }),
      config: {
        name: 'test_echo',
        template: ''
      },
      container,
      logger: ConsoleLogger.global
    };
    const handler = await container.create(EchoHandler, options);

    const cmd = Command.create({
      context: Context.create({
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      }),
      data: {},
      name: 'test_echo',
      type: 0
    });

    expect(await handler.check(cmd)).to.be.true;
    await handler.handle(cmd);
    expect(send).to.have.been.calledWithMatch(match.instanceOf(Message));
  });
});

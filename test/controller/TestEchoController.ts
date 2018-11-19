import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger } from 'noicejs';
import { match, spy } from 'sinon';

import { Bot } from 'src/Bot';
import { EchoController, EchoControllerOptions } from 'src/controller/EchoController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

describeAsync('echo controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

    const options: EchoControllerOptions = {
      bot: ineeda<Bot>(),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>(),
      }),
      container,
      data: {
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
    };
    const controller = await container.create(EchoController, options);
    expect(controller).to.be.an.instanceOf(EchoController);
  });

  itAsync('should handle commands', async () => {
    const { container } = await createContainer();

    const send = spy();
    const options: EchoControllerOptions = {
      bot: ineeda<Bot>({
        send,
      }),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => 'test_echo',
        }),
      }),
      container,
      data: {
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
     };
    const controller = await container.create(EchoController, options);

    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: '',
      }),
      data: {},
      noun: 'test_echo',
      verb: CommandVerb.Get,
    });

    expect(await controller.check(cmd)).to.equal(true);
    await controller.handle(cmd);
    expect(send).to.have.been.calledWithMatch(match.instanceOf(Message));
  });
});

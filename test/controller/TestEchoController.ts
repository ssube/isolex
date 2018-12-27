import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Bot } from 'src/Bot';
import { EchoController, NOUN_ECHO } from 'src/controller/EchoController';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Template } from 'src/utils/Template';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('echo controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

    const controller = await createService(container, EchoController, {
      data: {
        filters: [],
        strict: true,
        transforms: [{
          data: {
            filters: [],
            strict: true,
          },
          metadata: {
            kind: 'template-transform',
            name: 'test_template',
          },
        }],
      },
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
    });
    expect(controller).to.be.an.instanceOf(EchoController);
  });

  itAsync('should handle commands', async () => {
    const { container } = await createContainer();

    const sendMessage = spy();
    const controller = await createService(container, EchoController, {
      bot: ineeda<Bot>({
        sendMessage,
      }),
      compiler: ineeda<TemplateCompiler>({
        compile: () => ineeda<Template>({
          render: () => 'test_echo',
        }),
      }),
      data: {
        filters: [],
        strict: true,
        transforms: [{
          data: {
            filters: [],
            strict: true,
          },
          metadata: {
            kind: 'template-transform',
            name: 'test_template',
          },
        }],
      },
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
    });

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

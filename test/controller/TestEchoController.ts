import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Bot } from 'src/Bot';
import { EchoController, NOUN_ECHO } from 'src/controller/EchoController';
import { User } from 'src/entity/auth/User';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { ServiceModule } from 'src/module/ServiceModule';
import { TransformModule } from 'src/module/TransformModule';
import { Transform } from 'src/transform/Transform';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

describeAsync('echo controller', async () => {
  itAsync('should exist', async () => {
    const { container } = await createContainer();

    const controller = await createService(container, EchoController, {
      data: {
        filters: [],
        strict: true,
        transforms: [],
      },
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
    });
    expect(controller).to.be.an.instanceOf(EchoController);
  });

  itAsync('should handle commands', async () => {
    const modules = [new ServiceModule(), new TransformModule()];
    const { container, module } = await createContainer(...modules);

    const msg = 'hello world';
    module.bind('test-transform').toInstance(ineeda<Transform>({
      check: () => Promise.resolve(true),
      transform: (c: Command, type: string, data: object) => Promise.resolve(msg),
    }));

    const sendMessage = spy();
    const controller = await createService(container, EchoController, {
      bot: ineeda<Bot>({
        sendMessage,
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
            kind: 'test-transform',
            name: 'test_echo',
          },
        }],
      },
      metadata: {
        kind: 'echo-controller',
        name: 'test_echo',
      },
    });
    await controller.start();

    const cmd = new Command({
      context: ineeda<Context>({
        checkGrants: () => true,
        user: ineeda<User>(),
      }),
      data: {},
      labels: {},
      noun: NOUN_ECHO,
      verb: CommandVerb.Create,
    });

    expect(await controller.check(cmd)).to.equal(true);
    await controller.handle(cmd);
    expect(sendMessage).to.have.been.calledWithMatch(match.instanceOf(Message));
  });
});

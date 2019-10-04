import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { match, spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { EchoController, NOUN_ECHO } from '../../src/controller/EchoController';
import { User } from '../../src/entity/auth/User';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { Listener } from '../../src/listener';
import { ServiceModule } from '../../src/module/ServiceModule';
import { TransformModule } from '../../src/module/TransformModule';
import { Transform } from '../../src/transform';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_LISTENER = 'test-listener';

describeLeaks('echo controller', async () => {
  itLeaks('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, EchoController, {
      data: {
        defaultTarget: {
          kind: TEST_LISTENER,
          name: TEST_LISTENER,
        },
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

  itLeaks('should handle commands', async () => {
    const modules = [new ServiceModule({
      timeout: 100,
    }), new TransformModule()];
    const { container, module, services } = await createServiceContainer(...modules);

    services.addService(ineeda<Listener>({
      kind: TEST_LISTENER,
      name: TEST_LISTENER,
    }));

    const msg = 'hello world';
    module.bind('test-transform').toInstance(ineeda<Transform>({
      check: () => Promise.resolve(true),
      transform: (c: Command, type: string, data: object) => Promise.resolve({
        body: [msg],
      }),
    }));

    const sendMessage = spy();
    const controller = await createService(container, EchoController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: {
        defaultTarget: {
          kind: TEST_LISTENER,
          name: TEST_LISTENER,
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
        name: 'test-user',
        uid: 'test-user',
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

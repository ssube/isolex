import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { MissingValueError } from 'noicejs';
import { match, spy, stub } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { ErrorReplyType } from '../../src/controller/BaseController';
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

const TEST_DATA = {
  filters: [],
  redirect: {
    defaults: {},
    forces: {
      target: {
        service: {
          kind: TEST_LISTENER,
          name: TEST_LISTENER,
        },
        source: false,
      },
    },
  },
  strict: true,
  transforms: [],
};

const TEST_METADATA = {
  kind: 'echo-controller',
  name: 'test_echo',
};

class StubController extends EchoController {
  public errorReply(ctx: Context, errCode: ErrorReplyType, msg?: string): Promise<void> {
    return super.errorReply(ctx, errCode, msg);
  }

  public getSourceOrFail(ctx: Context): Listener {
    return super.getSourceOrFail(ctx);
  }

  public getUserOrFail(ctx: Context): User {
    return super.getUserOrFail(ctx);
  }

  public reply(ctx: Context, body: string): Promise<void> {
    return super.reply(ctx, body);
  }
}

describeLeaks('echo controller', async () => {
  itLeaks('should exist', async () => {
    const { container } = await createServiceContainer();

    const controller = await createService(container, EchoController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
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
        filters: [],
        redirect: {
          defaults: {},
          forces: {
            target: {
              service: {
                kind: TEST_LISTENER,
                name: TEST_LISTENER,
              },
              source: false,
            },
          },
        },
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
        getGrants: () => ['*:test'],
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

  itLeaks('should handle echo noun', async () => {
    const { container } = await createServiceContainer();
    const controller = await createService(container, EchoController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    expect(controller.getNouns()).to.include(NOUN_ECHO);
  });

  itLeaks('should throw when context has no source', async () => {
    const { container } = await createServiceContainer();
    const controller = await createService(container, StubController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    expect(() => controller.getSourceOrFail(ineeda<Context>({
      get source() {
        /* eslint-disable-next-line no-null/no-null, @typescript-eslint/no-explicit-any */
        return null as any;
      },
      set source(val: Listener) {
        /* noop */
      },
    }))).to.throw(MissingValueError);
  });

  itLeaks('should throw when context has no user', async () => {
    const { container } = await createServiceContainer();
    const controller = await createService(container, StubController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });
    expect(() => controller.getUserOrFail(ineeda<Context>({
      get user() {
        /* eslint-disable-next-line no-null/no-null, @typescript-eslint/no-explicit-any */
        return null as any;
      },
      set user(val: Listener) {
        /* noop */
      },
    }))).to.throw(MissingValueError);
  });

  itLeaks('should format a missing grant error', async () => {
    const { container } = await createServiceContainer();
    const controller = await createService(container, StubController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const ctx = ineeda<Context>();
    const reply = stub(controller, 'reply');
    await controller.errorReply(ctx, ErrorReplyType.GrantMissing);

    expect(reply).to.have.been.calledWith(ctx, match(/permission denied/));
  });

  itLeaks('should format a missing session error', async () => {
    const { container } = await createServiceContainer();
    const controller = await createService(container, StubController, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const ctx = ineeda<Context>();
    const reply = stub(controller, 'reply');
    await controller.errorReply(ctx, ErrorReplyType.SessionMissing);

    expect(reply).to.have.been.calledWith(ctx, match(/must be logged in/));
  });
});

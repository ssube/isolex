import { expect } from 'chai';
import { Request } from 'express';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { User } from '../../src/entity/auth/User';
import { GraphSchema } from '../../src/schema/graph';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('graph schema', async () => {
  itLeaks('should execute commands', async () => {
    const { container } = await createServiceContainer();
    const executeCommand = spy();
    const graph = await createService(container, GraphSchema, {
      [INJECT_BOT]: ineeda<Bot>({
        executeCommand,
      }),
      data: {
        filters: [],
        strict: false,
      },
      metadata: {
        kind: 'graph-schema',
        name: 'test-schema',
      },
    });
    await graph.executeCommands({
      commands: [],
    }, ineeda<Request>({
      user: ineeda<User>(),
    }));
    expect(executeCommand).to.have.callCount(1);
  });

  itLeaks('should send messages', async () => {
    const { container } = await createServiceContainer();
    const sendMessage = spy();
    const graph = await createService(container, GraphSchema, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: {
        filters: [],
        strict: false,
      },
      metadata: {
        kind: 'graph-schema',
        name: 'test-schema',
      },
    });
    await graph.sendMessages({
      messages: [],
    }, ineeda<Request>({
      user: ineeda<User>(),
    }));
    expect(sendMessage).to.have.callCount(1);
  });
  itLeaks('should get past commands');
  itLeaks('should get past messages');
  itLeaks('should get existing services');
  itLeaks('should get a single service');
});

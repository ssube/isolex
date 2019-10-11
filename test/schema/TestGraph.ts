import { expect } from 'chai';
import { Request } from 'express';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';
import { Repository } from 'typeorm';

import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_STORAGE } from '../../src/BotService';
import { User } from '../../src/entity/auth/User';
import { Command } from '../../src/entity/Command';
import { Message } from '../../src/entity/Message';
import { GraphSchema } from '../../src/schema/graph';
import { Storage } from '../../src/storage';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_SCHEMA = {
  kind: 'graph-schema',
  name: 'test-schema',
};

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
      metadata: TEST_SCHEMA,
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
      metadata: TEST_SCHEMA,
    });
    await graph.sendMessages({
      messages: [],
    }, ineeda<Request>({
      user: ineeda<User>(),
    }));
    expect(sendMessage).to.have.callCount(1);
  });

  itLeaks('should get past commands', async () => {
    const { container } = await createServiceContainer();
    const sendMessage = spy();
    const graph = await createService(container, GraphSchema, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      [INJECT_STORAGE]: ineeda<Storage>({
        getRepository: () => {
          return ineeda<Repository<Command>>({
            async findOne(id: string) {
              return ineeda.instanceof(Command);
            }
          });
        },
      }),
      data: {
        filters: [],
        strict: false,
      },
      metadata: TEST_SCHEMA,
   });
    const command = await graph.getCommand({
      id: '0',
    }, ineeda<Request>({
      user: ineeda<User>(),
    }));
    expect(Command.isCommand(command)).to.equal(true);
  });

  itLeaks('should get past messages', async () => {
    const { container } = await createServiceContainer();
    const sendMessage = spy();
    const graph = await createService(container, GraphSchema, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      [INJECT_STORAGE]: ineeda<Storage>({
        getRepository: () => {
          return ineeda<Repository<Message>>({
            async findOne(id: string) {
              return ineeda.instanceof(Message);
            }
          });
        },
      }),
      data: {
        filters: [],
        strict: false,
      },
      metadata: TEST_SCHEMA,
   });
    const message = await graph.getMessage({
      id: '0',
    }, ineeda<Request>({
      user: ineeda<User>(),
    }));
    expect(Message.isMessage(message)).to.equal(true);
  });

  itLeaks('should get existing services');
  itLeaks('should get a single service');
});

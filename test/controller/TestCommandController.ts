import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { CommandController } from '../../src/controller/CommandController';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { createService, createServiceContainer } from '../helpers/container';

describe('command controller', async () => {
  it('should execute the next command', async () => {
    const executeCommand = spy();
    const bot = ineeda<Bot>({
      async executeCommand() {
        executeCommand();
      },
    });
    const { container } = await createServiceContainer();
    const ctrl = await createService(container, CommandController, {
      [INJECT_BOT]: bot,
      data: {
        defaultCommand: {
          data: {},
          labels: {},
          noun: '',
          verb: CommandVerb.Create,
        },
        filters: [],
        redirect: {
          defaults: {},
          forces: {},
        },
        strict: true,
        transforms: [],
      },
      metadata: {
        kind: 'command-controller',
        name: 'test-controller',
      },
    });

    await ctrl.createCommand(ineeda<Command>(), ineeda<Context>());
    expect(executeCommand).to.have.callCount(1);
  });

  it('should filter out entities');
  it('should transform command data');
});

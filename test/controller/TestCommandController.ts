import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { CommandController } from '../../src/controller/CommandController';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('command controller', async () => {
  itLeaks('should execute the next command', async () => {
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

  itLeaks('should filter out entities');
  itLeaks('should transform command data');
});

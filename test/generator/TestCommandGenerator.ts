import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { CommandGenerator } from '../../src/generator/CommandGenerator';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestContextData } from '../helpers/context';

describe('command generator', async () => {
  it('should notify target services', async () => {
    const { container } = await createServiceContainer();
    const executeCommand = spy();
    const interval = await createService(container, CommandGenerator, {
      [INJECT_BOT]: ineeda<Bot>({
        executeCommand,
      }),
      data: {
        context: getTestContextData(),
        defaultCommand: {
          data: {},
          labels: {},
          noun: 'test',
          verb: CommandVerb.Create,
        },
        filters: [],
        frequency: {
          time: '30s',
        },
        redirect: {
          defaults: {},
          forces: {
            target: {
              kind: 'test-service',
              name: 'test-target',
            },
          },
        },
        strict: false,
      },
      metadata: {
        kind: 'command-endpoint',
        name: 'test-endpoint'
      },
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>({}));
    expect(status).to.equal(0);
    expect(executeCommand).to.have.callCount(1);
  });
});

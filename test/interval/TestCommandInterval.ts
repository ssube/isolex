import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { CommandInterval } from '../../src/interval/CommandInterval';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_SVC = 'some-service';

describeLeaks('command interval', async () => {
  itLeaks('should notify target services', async () => {
    const { container } = await createServiceContainer();
    const executeCommand = spy();
    const interval = await createService(container, CommandInterval, {
      [INJECT_BOT]: ineeda<Bot>({
        executeCommand,
      }),
      data: {
        defaultCommand: {
          data: {},
          labels: {},
          noun: 'test',
          verb: CommandVerb.Create,
        },
        defaultContext: {
          channel: {
            id: '',
            thread: '',
          },
          name: '',
          uid: '',
        },
        defaultTarget: {
          kind: 'test-service',
          name: 'test-target',
        },
        filters: [],
        frequency: {
          time: '30s',
        },
        services: [{
          kind: TEST_SVC,
          name: TEST_SVC,
        }],
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

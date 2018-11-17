import * as bunyan from 'bunyan';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container } from 'noicejs';

import { Bot } from 'src/Bot';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterOptions } from 'src/filter/UserFilter';
import { ChecklistMode } from 'src/utils/Checklist';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

const TEST_FILTER_NAME = 'test-filter';

async function createUserFilter(options: UserFilterOptions) {
  const { container } = await createContainer();
  const filter = await container.create<UserFilter, any>(UserFilter, {
    ...options,
    container,
  });
  return { container, filter };
}

describeAsync('user filter', async () => {
  itAsync('should have a working helper', async () => {
    const { filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      container: ineeda<Container>(),
      logger: bunyan.createLogger({
        name: 'test-user-filter',
      }),
      metadata: {
        kind: 'user-filter',
        name: TEST_FILTER_NAME,
      },
    });
    expect(filter).to.be.an.instanceof(UserFilter);
  });

  itAsync('should allow commands from allowed users', async () => {
    const { filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      container: ineeda<Container>(),
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'user-filter',
        name: TEST_FILTER_NAME,
      },
    });

    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: 'safe',
      }),
      data: {},
      noun: 'test',
      verb: CommandVerb.None,
    });
    const behavior = await filter.filter(cmd);
    expect(behavior).to.equal(FilterBehavior.Allow);
  });

  itAsync('should filter out commands from banned users', async () => {
    const { filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      container: ineeda<Container>(),
      logger: ConsoleLogger.global,
      metadata: {
        kind: 'user-filter',
        name: TEST_FILTER_NAME,
      },
     });

    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: 'test',
      }),
      data: {},
      noun: 'test',
      verb: CommandVerb.None,
    });
    const behavior = await filter.filter(cmd);
    expect(behavior).to.equal(FilterBehavior.Drop);
  });
});

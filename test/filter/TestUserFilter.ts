import * as bunyan from 'bunyan';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container } from 'noicejs';
import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterOptions } from 'src/filter/UserFilter';
import { ServiceModule } from 'src/module/ServiceModule';
import { ChecklistMode } from 'src/utils/Checklist';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

const TEST_FILTER_KIND = 'user-filter';
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
      container: ineeda<Container>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      logger: bunyan.createLogger({
        name: 'test-user-filter',
      }),
      metadata: {
        kind: TEST_FILTER_KIND,
        name: TEST_FILTER_NAME,
      },
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
    });
    expect(filter).to.be.an.instanceof(UserFilter);
  });

  itAsync('should allow commands from allowed users', async () => {
    const { filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      container: ineeda<Container>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      logger: ConsoleLogger.global,
      metadata: {
        kind: TEST_FILTER_KIND,
        name: TEST_FILTER_NAME,
      },
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
    });

    const cmd = new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Get,
    });
    const behavior = await filter.check(cmd);
    expect(behavior).to.equal(FilterBehavior.Allow);
  });

  itAsync('should filter out commands from banned users', async () => {
    const { filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      container: ineeda<Container>(),
      data: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
      logger: ConsoleLogger.global,
      metadata: {
        kind: TEST_FILTER_KIND,
        name: TEST_FILTER_NAME,
      },
      metrics: new Registry(),
      services: ineeda<ServiceModule>(),
      storage: ineeda<Connection>(),
    });

    const cmd = new Command({
      context: ineeda<Context>({
        userName: 'test',
      }),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Get,
    });
    const behavior = await filter.check(cmd);
    expect(behavior).to.equal(FilterBehavior.Drop);
  });
});

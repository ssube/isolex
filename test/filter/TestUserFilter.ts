import * as bunyan from 'bunyan';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { ConsoleLogger, Container } from 'noicejs';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterOptions } from 'src/filter/UserFilter';
import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer } from 'test/helpers/container';

async function createUserFilter(options: UserFilterOptions) {
  const { container } = await createContainer();
  const filter = await container.create<UserFilter, any>(UserFilter, {
    ...options,
    container
  });
  return { container, filter };
}

describeAsync('user filter', async () => {
  itAsync('should have a working helper', async () => {
    const { container, filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      config: {
        ignore: ['test']
      },
      container: ineeda<Container>(),
      logger: bunyan.createLogger({
        name: 'test-user-filter'
      })
    });
    expect(filter).to.be.an.instanceof(UserFilter);
  });

  itAsync('should allow commands from allowed users', async () => {
    const ignore = ['test'];
    const { container, filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      config: { ignore },
      container: ineeda<Container>(),
      logger: ConsoleLogger.global
    });
    expect(filter.getIgnore()).to.deep.equal(ignore);

    const cmd = Command.create({
      context: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: 'safe'
      },
      data: {},
      name: 'test',
      type: 0
    });
    const behavior = await filter.filter(cmd);
    expect(behavior).to.equal(FilterBehavior.Allow);
  });

  itAsync('should filter out commands from banned users', async () => {
    const ignore = ['test'];
    const { container, filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      config: { ignore },
      container: ineeda<Container>(),
      logger: ConsoleLogger.global
    });
    expect(filter.getIgnore()).to.deep.equal(ignore);

    const cmd = Command.create({
      context: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: 'test'
      },
      data: {},
      name: 'test',
      type: 0
    });
    const behavior = await filter.filter(cmd);
    expect(behavior).to.equal(FilterBehavior.Drop);
  });
});

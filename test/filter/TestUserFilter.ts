import * as bunyan from 'bunyan';
import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Container } from 'noicejs';
import { Bot } from 'src/Bot';
import { Command } from 'src/Command';
import { FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterOptions } from 'src/filter/UserFilter';
import { describeAsync, itAsync } from 'test/helpers/async';

async function createUserFilter(options: UserFilterOptions) {
  const container = new Container([]);
  await container.configure();
  const filter = await container.create<UserFilter, any>(UserFilter, {
    config: {
      ignore: ['test']
    }
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
      logger: bunyan.createLogger({
        name: 'test-user-filter'
      })
    });
    expect(filter).to.be.an.instanceof(UserFilter);
  });

  itAsync('should filter out commands from banned users', async () => {
    const { container, filter } = await createUserFilter({
      bot: ineeda<Bot>(),
      config: {
        ignore: ['test']
      },
      logger: bunyan.createLogger({
        name: 'test-user-filter'
      })
    });
    const cmd = new Command({
      data: {},
      from: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: 'test'
      },
      name: 'test',
      type: 0
    });
    const behavior = await filter.filter(cmd);
    expect(behavior).to.equal(FilterBehavior.Allow);
  });
});

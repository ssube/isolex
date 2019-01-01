import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterData } from 'src/filter/UserFilter';
import { ChecklistMode } from 'src/utils/Checklist';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

const TEST_FILTER_KIND = 'user-filter';
const TEST_FILTER_NAME = 'test-filter';

async function createUserFilter(data: UserFilterData) {
  const { container } = await createContainer();
  const filter = await createService(container, UserFilter, {
    data,
    metadata: {
      kind: TEST_FILTER_KIND,
      name: TEST_FILTER_NAME,
    },
  });
  return { container, filter };
}

describeAsync('user filter', async () => {
  itAsync('should have a working helper', async () => {
    const { filter } = await createUserFilter({
      filters: [],
      strict: true,
      users: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
    });
    expect(filter).to.be.an.instanceof(UserFilter);
  });

  itAsync('should allow commands from allowed users', async () => {
    const { filter } = await createUserFilter({
      filters: [],
      strict: true,
      users: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
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
      filters: [],
      strict: true,
      users: {
        data: ['test'],
        mode: ChecklistMode.EXCLUDE,
      },
    });

    const cmd = new Command({
      context: ineeda<Context>({
        name: 'test',
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

import { ChecklistMode } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { FilterBehavior } from '../../src/filter';
import { UserFilter, UserFilterData } from '../../src/filter/UserFilter';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_FILTER_KIND = 'user-filter';
const TEST_FILTER_NAME = 'test-filter';

// tslint:disable:no-identical-functions
async function createUserFilter(data: UserFilterData) {
  const { container } = await createServiceContainer();
  const filter = await createService(container, UserFilter, {
    data,
    metadata: {
      kind: TEST_FILTER_KIND,
      name: TEST_FILTER_NAME,
    },
  });
  return { container, filter };
}

describe('user filter', async () => {
  it('should have a working helper', async () => {
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

  it('should allow commands from allowed users', async () => {
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

  it('should filter out users by name', async () => {
    const { filter } = await createUserFilter({
      filters: [],
      strict: true,
      users: {
        data: ['in'],
        mode: ChecklistMode.EXCLUDE,
      },
    });

    const cmd = new Command({
      context: ineeda<Context>({
        name: 'in',
        uid: 'out',
      }),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Get,
    });
    const behavior = await filter.check(cmd);
    expect(behavior).to.equal(FilterBehavior.Drop);
  });

  it('should filter out users by uid', async () => {
    const { filter } = await createUserFilter({
      filters: [],
      strict: true,
      users: {
        data: ['in'],
        mode: ChecklistMode.EXCLUDE,
      },
    });

    const cmd = new Command({
      context: ineeda<Context>({
        name: 'out',
        uid: 'in',
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

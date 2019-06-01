import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { FilterBehavior } from 'src/filter';
import { CommandFilter, CommandFilterData } from 'src/filter/CommandFilter';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createService, createServiceContainer } from 'test/helpers/container';

const TEST_FILTER_KIND = 'user-filter';
const TEST_FILTER_NAME = 'test-filter';

async function createFilter(data: CommandFilterData) {
  const { container } = await createServiceContainer();
  const filter = await createService(container, CommandFilter, {
    data,
    metadata: {
      kind: TEST_FILTER_KIND,
      name: TEST_FILTER_NAME,
    },
  });
  return { container, filter };
}

describeAsync('command filter', async () => {
  itAsync('should allow matching commands', async () => {
    const { filter } = await createFilter({
      filters: [],
      match: {
        rules: [],
      },
      strict: true,
    });
    const result = await filter.check(new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Delete,
    }));
    expect(result).to.equal(FilterBehavior.Allow);
  });

  xit('should drop other commands');
  xit('should ignore other entities');
});

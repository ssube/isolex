import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { CommandFilter, CommandFilterData } from '../../src/filter/CommandFilter';
import { RuleOperator } from '../../src/utils/MatchRules';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { createService, createServiceContainer } from '../helpers/container';

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

describe('command filter', async () => {
  it('should allow matching commands', async () => {
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

  it('should ignore other entities', async () => {
    const { filter } = await createFilter({
      filters: [],
      match: {
        rules: [],
      },
      strict: true,
    });
    const result = await filter.check(new Message({
      body: '',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(result).to.equal(FilterBehavior.Ignore);
  });

  it('should drop other commands', async () => {
    const { filter } = await createFilter({
      filters: [],
      match: {
        rules: [{
          key: '$.noun',
          operator: RuleOperator.Every,
          values: [{
            string: 'false',
          }, {
            string: 'true',
          }],
        }],
      },
      strict: true,
    });
    const result = await filter.check(new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    }));
    expect(result).to.equal(FilterBehavior.Drop);
  });

  it('should check command labels (#561)', async () => {
    const { filter } = await createFilter({
      filters: [],
      match: {
        rules: [{
          key: '$.labels.kind',
          operator: RuleOperator.Any,
          values: [{
            string: 'build',
          }, {
            string: 'pipeline',
          }, {
            string: 'push',
          }],
        }],
      },
      strict: true,
    });
    const result = await filter.check(new Command({
      context: ineeda<Context>(),
      data: {},
      labels: {},
      noun: 'test',
      verb: CommandVerb.Create,
    }));
    expect(result).to.equal(FilterBehavior.Drop);
  });
});

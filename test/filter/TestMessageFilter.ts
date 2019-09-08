import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { MessageFilter, MessageFilterData } from '../../src/filter/MessageFilter';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeAsync, itAsync } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_FILTER_KIND = 'user-filter';
const TEST_FILTER_NAME = 'test-filter';

async function createFilter(data: MessageFilterData) {
  const { container } = await createServiceContainer();
  const filter = await createService(container, MessageFilter, {
    data,
    metadata: {
      kind: TEST_FILTER_KIND,
      name: TEST_FILTER_NAME,
    },
  });
  return { container, filter };
}

describeAsync('message filter', async () => {
  itAsync('should allow matching messages', async () => {
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
    expect(result).to.equal(FilterBehavior.Allow);
  });

  xit('should drop other messages');
  xit('should ignore other entities');
});

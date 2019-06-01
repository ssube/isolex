import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { FilterBehavior } from 'src/filter';
import { SourceFilter, SourceFilterData } from 'src/filter/SourceFilter';
import { TYPE_TEXT } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createService, createServiceContainer } from 'test/helpers/container';

const TEST_FILTER_KIND = 'user-filter';
const TEST_FILTER_NAME = 'test-filter';

async function createFilter(data: SourceFilterData) {
  const { container } = await createServiceContainer();
  const filter = await createService(container, SourceFilter, {
    data,
    metadata: {
      kind: TEST_FILTER_KIND,
      name: TEST_FILTER_NAME,
    },
  });
  return { container, filter };
}

describeAsync('source filter', async () => {
  itAsync('should drop messages with a different type', async () => {
    const { filter } = await createFilter({
      filters: [],
      strict: true,
      type: 'text/plain',
    });

    const behavior = await filter.check(new Message({
      body: '',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));

    expect(behavior).to.equal(FilterBehavior.Allow);
  });
});

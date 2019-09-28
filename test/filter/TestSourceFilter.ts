import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { SourceFilter, SourceFilterData } from '../../src/filter/SourceFilter';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

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

describeLeaks('source filter', async () => {
  itLeaks('should drop messages with a different type', async () => {
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

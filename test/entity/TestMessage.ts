import { expect } from 'chai';

import { Message } from '../../src/entity/Message';
import { TYPE_TEXT } from '../../src/utils/Mime';

const TEST_BODY = 'test body';

describe('message entity', async () => {
  it('should convert itself to JSON', async () => {
    const msg = new Message({
      body: TEST_BODY,
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    });
    const json = msg.toJSON();

    expect(json).to.have.property('body', TEST_BODY);
  });
});

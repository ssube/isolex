import { expect } from 'chai';

import { Message } from '../../src/entity/Message';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';

const TEST_BODY = 'test body';

describeLeaks('message entity', async () => {
  itLeaks('should convert itself to JSON', async () => {
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

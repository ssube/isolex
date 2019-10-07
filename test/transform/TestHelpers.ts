import { expect } from 'chai';
import { ineeda } from 'ineeda';

import { Message } from '../../src/entity/Message';
import { applyTransforms } from '../../src/transform/helpers';
import { TYPE_TEXT } from '../../src/utils/Mime';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('transform helpers', async () => {
  describeLeaks('apply transforms helper', async () => {
    itLeaks('should return empty output with no transforms', async () => {
      const output = await applyTransforms([], ineeda<Message>({}), TYPE_TEXT, {});
      expect(output).to.deep.equal({});
    });
  });
});

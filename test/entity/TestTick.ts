import { expect } from 'chai';

import { Tick } from '../../src/entity/Tick';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('tick entity', async () => {
  itLeaks('should convert itself to JSON', async () => {
    const tick = new Tick({
      intervalId: '0',
      status: 0,
    });
    const json = tick.toJSON();
    expect(json).to.have.property('intervalId');
    expect(json).to.have.property('status');
  });
});

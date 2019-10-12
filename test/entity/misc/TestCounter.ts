import { expect } from 'chai';

import { Counter } from '../../../src/entity/misc/Counter';
import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('counter entity', async () => {
  itLeaks('should convert itself to json', async () => {
    const counter = new Counter({
      count: 0,
      name: '',
      roomId: '',
    });

    const json = counter.toJSON();
    expect(json).to.have.property('count');
    expect(json).to.have.property('id');
    expect(json).to.have.property('name');
    expect(json).to.have.property('roomId');
  });
});

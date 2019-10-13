import { expect } from 'chai';

import { Picklist } from '../../src/utils/Picklist';
import { describeLeaks, itLeaks } from '../helpers/async';

const PICK_COUNT = 3;
const PICK_REPS = 10_000;

describeLeaks('pick list', async () => {
  itLeaks('should pick one random item', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1,
      }, {
        value: 'y',
        weight: 1,
      }],
    });

    for (let i = 0; i < PICK_REPS; i += 1) {
      expect(list.pickOne()).to.be.oneOf(['x', 'y']);
    }
  });

  itLeaks('should pick one weighted item', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1,
      }, {
        value: 'y',
        weight: 0,
      }],
    });

    for (let i = 0; i < PICK_REPS; i += 1) {
      expect(list.pickOne()).to.equal('x');
    }
  });

  itLeaks('should pick some random items', async () => {
    const counter = {x: 0, y: 0};
    const list = new Picklist<keyof typeof counter>({
      data: [{
        value: 'x',
        weight: 1,
      }, {
        value: 'y',
        weight: 1,
      }],
    });

    for (let i = 0; i < PICK_REPS; i += 1) {
      counter[list.pickOne()] += 1;
    }

    expect(counter.x).to.be.greaterThan(0);
    expect(counter.y).to.be.greaterThan(0);
  });

  itLeaks('should pick some weighted items', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1,
      }, {
        value: 'y',
        weight: 0,
      }],
    });

    for (let i = 0; i < PICK_REPS; i += 2) {
      const puck = list.pick(PICK_COUNT);
      expect(puck).to.have.property('length', 3);
      expect(puck).to.deep.equal(['x', 'x', 'x']);
    }
  });

  itLeaks('should convert a list', async () => {
    const list = Picklist.create('x', 'y', 'z');
    expect(list.length).to.equal(3);
  });
});

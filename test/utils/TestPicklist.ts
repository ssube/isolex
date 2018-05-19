import { expect } from 'chai';
import { ConsoleLogger, Container } from 'noicejs';

import { defer } from 'src/utils';
import { Picklist } from 'src/utils/Picklist';
import { describeAsync, itAsync } from 'test/helpers/async';

const PICK_COUNT = 3;
const PICK_REPS = 10_000;

describeAsync('pick list', async () => {
  itAsync('should pick one random item', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1
      }, {
        value: 'y',
        weight: 1
      }]
    });

    for (let i = 0; i < PICK_REPS; ++i) {
      expect(list.pickOne()).to.be.oneOf(['x', 'y']);
    }
  });

  itAsync('should pick one weighted item', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1
      }, {
        value: 'y',
        weight: 0
      }]
    });

    for (let i = 0; i < PICK_REPS; ++i) {
      expect(list.pickOne()).to.equal('x');
    }
  });

  itAsync('should pick some random items', async () => {
    const counter = {x: 0, y: 0};
    const list = new Picklist<keyof typeof counter>({
      data: [{
        value: 'x',
        weight: 1
      }, {
        value: 'y',
        weight: 1
      }]
    });

    for (let i = 0; i < PICK_REPS; ++i) {
      counter[list.pickOne()] += 1;
    }
  });

  itAsync('should pick some weighted items', async () => {
    const list = new Picklist({
      data: [{
        value: 'x',
        weight: 1
      }, {
        value: 'y',
        weight: 0
      }]
    });

    for (let i = 0; i < PICK_REPS; ++i) {
      const puck = list.pick(PICK_COUNT);
      expect(puck).to.have.property('length', 3);
      expect(puck).to.deep.equal(['x', 'x', 'x']);
    }
  });
});

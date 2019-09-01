import { expect } from 'chai';

import { NotFoundError } from '../../src/error/NotFoundError';
import { countList, filterNil, leftPad, mustFind } from '../../src/utils';
import { describeAsync, itAsync } from '../helpers/async';

describeAsync('utils', async () => {
  describeAsync('left pad', async () => {
    itAsync('should prepend padding', async () => {
      expect(leftPad('test')).to.equal('0000test');
    });

    itAsync('should return long strings as-is', async () => {
      const long = 'testing-words';
      expect(leftPad(long, 8)).to.equal(long);
    });

    itAsync('should use padding string', async () => {
      expect(leftPad('test', 8, 'too')).to.equal('toottest', 'must repeat and truncate the padding string');
    });
  });

  describeAsync('count list', async () => {
    itAsync('should count a single item', async () => {
      expect(countList(1)).to.equal(1, 'numbers');
      expect(countList('')).to.equal(1, 'empty strings');
      expect(countList('123')).to.equal(1, 'other strings');
    });

    itAsync('should count an array of items', async () => {
      expect(countList([1])).to.equal(1, 'single item list');
      expect(countList([1, 2, 3])).to.equal(3, 'multi item list');
    });

    itAsync('should count an unknown argument as 0', async () => {
      expect(countList(undefined)).to.equal(0, 'undefined');
      // tslint:disable-next-line:no-null-keyword
      expect(countList(null)).to.equal(0, 'null');
    });
  });

  describeAsync('filter nil', async () => {
    itAsync('should remove nil items', async () => {
      // tslint:disable-next-line:no-null-keyword
      expect(filterNil([1, undefined, 2, null, 3])).to.deep.equal([1, 2, 3]);
    });
  });

  describeAsync('must find helper', async () => {
    itAsync('should return matching item', async () => {
      expect(mustFind([1, 2, 3], (val) => (val % 2) === 0)).to.equal(2);
    });

    itAsync('should throw if no item matches', async () => {
      expect(() => {
        mustFind([1, 2, 3], (val) => val === 4);
      }).to.throw(NotFoundError);
    });
  });
});

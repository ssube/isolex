import { expect } from 'chai';

import { countList, leftPad } from 'src/utils';

import { describeAsync, itAsync } from 'test/helpers/async';

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
});

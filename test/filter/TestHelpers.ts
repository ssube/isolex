import { expect } from 'chai';

import { checkFilter, FilterBehavior } from '../../src/filter';

describe('filter helpers', () => {
  describe('check filter behavior helper', () => {
    it('should require allow behavior in strict mode', () => {
      expect(checkFilter(FilterBehavior.Allow, true)).to.equal(true, 'allow allowed');

      expect(checkFilter(FilterBehavior.Drop, true)).to.equal(false, 'drop dropped');
      expect(checkFilter(FilterBehavior.Ignore, true)).to.equal(false, 'ignore dropped');
    });

    it('should reject drop behavior in loose mode', () => {
      expect(checkFilter(FilterBehavior.Allow, false)).to.equal(true, 'allow allowed');
      expect(checkFilter(FilterBehavior.Ignore, false)).to.equal(true, 'ignore allowed');

      expect(checkFilter(FilterBehavior.Drop, false)).to.equal(false, 'drop dropped');
    });
  });
});

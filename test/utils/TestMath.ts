import { expect } from 'chai';

import { clamp } from '../../src/utils/Math';

describe('math utils', () => {
  describe('clamp', () => {
    it('should return values within the range', () => {
      expect(clamp(4, 2, 5)).to.equal(4);
      expect(clamp(8, 1, 9)).to.equal(8);
    });

    it('should clamp values outside of the range', () => {
      expect(clamp(9, 2, 5)).to.equal(5);
      expect(clamp(2, 4, 6)).to.equal(4);
    });
  });
});

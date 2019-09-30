import { expect } from 'chai';

import { clamp, formatResult, ResultFormatOptions } from '../../src/utils/Math';

const TEST_SCOPE = {};
const TEST_OPTIONS: ResultFormatOptions = {
  list: {
    join: ',',
  },
  node: {
    implicit: 'keep',
    parenthesis: 'keep',
  },
  number: {
    // ?
  },
};

const DEC_VALUE = 3.2;
const INT_VALUE = 1.0;
const NIL_RESULT = 'nil result';

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

  describe('format result', () => {
    it('should format nil results', () => {
      /* tslint:disable-next-line:no-null-keyword */
      expect(formatResult(null, TEST_SCOPE, TEST_OPTIONS)).to.equal(NIL_RESULT);
      expect(formatResult(undefined, TEST_SCOPE, TEST_OPTIONS)).to.equal(NIL_RESULT);
    });

    it('should format boolean results', () => {
      expect(formatResult(true, TEST_SCOPE, TEST_OPTIONS)).to.equal('true');
      expect(formatResult(false, TEST_SCOPE, TEST_OPTIONS)).to.equal('false');
    });

    it('should format number results', () => {
      expect(formatResult(INT_VALUE, TEST_SCOPE, TEST_OPTIONS)).to.equal('1');
      expect(formatResult(DEC_VALUE, TEST_SCOPE, TEST_OPTIONS)).to.equal('3.2');
    });

    it('should format string results', () => {
      for (const str of [
        'foo',
        'bar',
      ]) {
        expect(formatResult(str, TEST_SCOPE, TEST_OPTIONS)).to.equal(str);
      }
    });

    it('should format date results');
    it('should recursive over array results', () => {
      expect(formatResult([], TEST_SCOPE, TEST_OPTIONS)).to.equal('');
      expect(formatResult([true, false], TEST_SCOPE, TEST_OPTIONS)).to.equal('true,false');
    });

    it('should serialize object results', () => {
      expect(formatResult({}, TEST_SCOPE, TEST_OPTIONS)).to.equal('{}');
      expect(formatResult({
        bar: DEC_VALUE,
        foo: INT_VALUE,
      }, TEST_SCOPE, TEST_OPTIONS)).to.equal(`{"bar":${DEC_VALUE},"foo":${INT_VALUE}}`);
    });

    it('should bail on regexp results', () => {
      expect(formatResult(/foo/, TEST_SCOPE, TEST_OPTIONS)).to.equal('regexp');
    });

    it('should format math results');
    it('should format math result sets');
    it('should format math nodes');
  });
});

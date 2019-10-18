import { expect } from 'chai';

import { leftPad, trim } from '../../src/utils/String';
import { describeLeaks, itLeaks } from '../helpers/async';

const TEST_SHORT = 'hello';
const TEST_LONG = 'hello world';

describeLeaks('left pad helper', async () => {
  itLeaks('should prepend padding', async () => {
    expect(leftPad('test')).to.equal('0000test');
  });

  itLeaks('should return long strings as-is', async () => {
    const long = 'testing-words';
    expect(leftPad(long, 8)).to.equal(long);
  });

  itLeaks('should use padding string', async () => {
    expect(leftPad('test', 8, 'too')).to.equal('toottest', 'must repeat and truncate the padding string');
  });
});

describeLeaks('trim helper', async () => {
  itLeaks('should return strings shorter than max', async () => {
    expect(trim('yes', 5)).to.equal('yes', 'shorter than max');
    expect(trim(TEST_SHORT, 5)).to.equal(TEST_SHORT, 'equal to max');
  });

  itLeaks('should trim strings longer than max', async () => {
    expect(trim(TEST_LONG, 3, '...')).to.equal('...');
    expect(trim(TEST_LONG, 5)).to.equal('he...');
    expect(trim(TEST_LONG, 8)).to.equal('hello...');
  });

  itLeaks('should not add tail when max is small', async () => {
    expect(trim(TEST_SHORT, 2, '...')).to.equal('he');
    expect(trim(TEST_LONG, 5, 'very long tail')).to.equal(TEST_SHORT);
    expect(trim(TEST_SHORT, 8, 'very long tail')).to.equal(TEST_SHORT);
  });
});

import { expect } from 'chai';

import { leftPad } from '../../src/utils/String';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('left pad', async () => {
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

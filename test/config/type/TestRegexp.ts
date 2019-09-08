import { expect } from 'chai';

import { regexpType } from '../../../src/config/type/Regexp';
import { describeAsync, itAsync } from '../../helpers/async';

describeAsync('regexp config type', async () => {
  itAsync('match slashed strings', async () => {
    expect(regexpType.resolve('/foo/')).to.equal(true);
  });

  itAsync('should match flags', async () => {
    const regexp: RegExp = regexpType.construct('/foo/g');
    expect(regexp.flags).to.equal('g');
  });

  itAsync('should not match bare strings', async () => {
    expect(regexpType.resolve('foo')).to.equal(false);
  });
});

import { expect } from 'chai';
import { join } from 'path';

import { includeType } from '../../../src/config/type/Include';
import { describeAsync, itAsync } from '../../helpers/async';

const TEST_ROOT = '../test/config/type';

describeAsync('include config type', async () => {
  itAsync('should resolve existing files', async () => {
    expect(includeType.resolve(join(TEST_ROOT, 'include.yml'))).to.equal(true);
  });

  itAsync('should throw on missing files', async () => {
    expect(() => {
      includeType.resolve(join(TEST_ROOT, 'missing.yml'));
    }).to.throw(Error);
  });

  itAsync('should read contents of file', async () => {
    expect(includeType.construct(join(TEST_ROOT, 'include.yml'))).to.equal('test');
  });
});

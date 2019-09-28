import { expect } from 'chai';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { includeType } from '../../../src/config/type/Include';
import { NotFoundError } from '../../../src/error/NotFoundError';
import { describeAsync, itAsync } from '../../helpers/async';

const TEST_ROOT = '../test/config/type';

describeAsync('include config type', async () => {
  itAsync('should resolve existing files', async () => {
    expect(includeType.resolve(join(TEST_ROOT, 'include.yml'))).to.equal(true);
  });

  itAsync('should throw when resolving missing files', async () => {
    expect(() => {
      includeType.resolve(join(TEST_ROOT, 'missing.yml'));
    }).to.throw(NotFoundError);
  });

  itAsync('should construct data from file', async () => {
    expect(includeType.construct(join(TEST_ROOT, 'include.yml'))).to.equal('test');
  });

  itAsync('should throw when constructing missing files', async () => {
    expect(() => {
      includeType.construct(join(TEST_ROOT, 'missing.yml'));
    }).to.throw(BaseError);
  });
});

import { expect } from 'chai';
import { BaseError } from 'noicejs';

import { includeType } from 'src/config/type/Include';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('include config type', async () => {
  itAsync('resolve existing files', async () => {
    expect(includeType.resolve('./include.yml')).to.equal(true);
  });

  itAsync('throw on missing files', async () => {
    expect(() => {
      includeType.resolve('./missing.yml');
    }).to.throw(BaseError);
  });

  itAsync('read contents of file', async () => {
    expect(includeType.construct('./include.yml')).to.equal('test');
  });
});

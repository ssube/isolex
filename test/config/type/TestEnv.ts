import { expect } from 'chai';

import { envType } from 'src/config/type/Env';
import { NotFoundError } from 'src/error/NotFoundError';
import { VERSION_INFO } from 'src/version';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('env config type', async () => {
  itAsync('throw on missing variables', async () => {
    expect(() => {
      envType.resolve('DOES_NOT_EXIST_');
    }).to.throw(NotFoundError);
  });

  itAsync('resolve existing variables', async () => {
    expect(envType.resolve('CI_COMMIT_SHA')).to.equal(true);
  });

  itAsync('construct a value from variables', async () => {
    expect(envType.construct('CI_COMMIT_SHA')).to.equal(VERSION_INFO.git.commit);
  });
});

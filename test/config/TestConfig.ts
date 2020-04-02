import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { join } from 'path';

import { loadConfig } from '../../src/config';

describe('load config helper', async () => {
  it('should load an existing config', async () => {
    const config = await loadConfig('isolex.yml', join(__dirname, '..', 'docs'));
    expect(config.metadata.kind).to.equal('bot');
  });

  it('should throw when config is missing', async () =>
    expect(loadConfig('missing.yml', join(__dirname, '..', 'docs'))).to.eventually.be.rejectedWith(NotFoundError)
  );
});

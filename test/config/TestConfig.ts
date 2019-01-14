import { expect } from 'chai';
import { join } from 'path';

import { loadConfig } from 'src/config';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('config', async () => {
  itAsync('load existing config', async () => {
    const config = await loadConfig('isolex.yml', join(__dirname, '../docs'));
    expect(config.metadata.kind).to.equal('bot');
  });
});

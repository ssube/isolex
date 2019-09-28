import { expect } from 'chai';
import { join } from 'path';

import { loadConfig } from '../../src/config';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('config', async () => {
  itLeaks('load existing config', async () => {
    const config = await loadConfig('isolex.yml', join(__dirname, '../docs'));
    expect(config.metadata.kind).to.equal('bot');
  });
});

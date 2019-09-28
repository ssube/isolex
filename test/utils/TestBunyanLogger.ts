import bunyan from 'bunyan';
import { expect } from 'chai';

import { BunyanLogger } from '../../src/utils/BunyanLogger';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('bunyan logger', async () => {
  itLeaks('should create a logger', async () => {
    const logger = BunyanLogger.create({
      name: 'test-logger',
    });
    expect(logger).to.be.an.instanceOf(bunyan);
  });
});

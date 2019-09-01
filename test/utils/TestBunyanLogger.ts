import * as bunyan from 'bunyan';
import { expect } from 'chai';

import { BunyanLogger } from '../../src/utils/BunyanLogger';
import { describeAsync, itAsync } from '../helpers/async';

describeAsync('bunyan logger', async () => {
  itAsync('should create a logger', async () => {
    const logger = BunyanLogger.create({
      name: 'test-logger',
    });
    expect(logger).to.be.an.instanceOf(bunyan);
  });
});

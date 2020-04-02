import bunyan from 'bunyan';
import { expect } from 'chai';

import { BunyanLogger } from '../../src/logger/BunyanLogger';

describe('bunyan logger', async () => {
  it('should create a logger', async () => {
    const logger = BunyanLogger.create({
      name: 'test-logger',
    });
    expect(logger).to.be.an.instanceOf(bunyan);
  });
});

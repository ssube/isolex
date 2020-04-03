import { spyLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../src/BaseService';
import { StorageLogger } from '../../src/logger/StorageLogger';
import { createContainer } from '../helpers/container';

/* tslint:disable:no-unbound-method no-identical-functions */
describe('storage logger', async () => {
  it('should forward migration messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(StorageLogger);
    logger.logMigration('foo');
    expect(info).to.have.callCount(1);
  });

  it('should forward query messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(StorageLogger);
    logger.logQuery('foo');
    expect(debug).to.have.callCount(1);
  });

  it('should forward query error messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));
    const logger = await container.create(StorageLogger);

    logger.logQueryError('foo', 'bar');
    expect(warn).to.have.callCount(1);
  });

  it('should forward query slow messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));

    const logger = await container.create(StorageLogger);
    logger.logQuerySlow(1, 'foo');
    expect(warn).to.have.callCount(1);
  });

  it('should forward schema messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(StorageLogger);
    logger.logSchemaBuild('foo');
    expect(info).to.have.callCount(1);
  });

  it('should log messages with passed level', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(StorageLogger);
    logger.log('info', 'foo');
    expect(info).to.have.callCount(1);
  });
});

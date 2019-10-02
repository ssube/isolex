import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../../src/BaseService';
import { StorageLogger } from '../../../src/utils/logger/StorageLogger';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createContainer } from '../../helpers/container';
import { spyLogger } from '../../helpers/logger';

/* tslint:disable:no-unbound-method no-identical-functions */
describeLeaks('storage logger', async () => {
  itLeaks('should forward migration messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(StorageLogger);
    logger.logMigration('foo');
    expect(info).to.have.callCount(1);
  });

  itLeaks('should forward query messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(StorageLogger);
    logger.logQuery('foo');
    expect(debug).to.have.callCount(1);
  });

  itLeaks('should forward query error messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));
    const logger = await container.create(StorageLogger);

    logger.logQueryError('foo', 'bar');
    expect(warn).to.have.callCount(1);
  });

  itLeaks('should forward query slow messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));

    const logger = await container.create(StorageLogger);
    logger.logQuerySlow(1, 'foo');
    expect(warn).to.have.callCount(1);
  });

  itLeaks('should forward schema messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(StorageLogger);
    logger.logSchemaBuild('foo');
    expect(info).to.have.callCount(1);
  });
});

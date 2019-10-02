import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../../src/BaseService';
import { LocaleLogger } from '../../../src/utils/logger/LocaleLogger';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createContainer } from '../../helpers/container';
import { spyLogger } from '../../helpers/logger';

/* tslint:disable:no-unbound-method */
const LOG_ARGS = ['test'];

describeLeaks('locale logger', async () => {
  itLeaks('should forward error messages', async () => {
    const { container, module } = await createContainer();
    const error = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      error,
    }));

    const logger = await container.create(LocaleLogger);
    logger.error(LOG_ARGS);
    expect(error).to.have.callCount(1);
  });

  itLeaks('should forward debug messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(LocaleLogger);
    logger.log(LOG_ARGS);
    expect(debug).to.have.callCount(1);
  });

  itLeaks('should forward warn messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));

    const logger = await container.create(LocaleLogger);
    logger.warn(LOG_ARGS);
    expect(warn).to.have.callCount(1);
  });
});

import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../../src/BaseService';
import { SlackLogger } from '../../../src/utils/logger/SlackLogger';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createContainer } from '../../helpers/container';
import { spyLogger } from '../../helpers/logger';

/* tslint:disable:no-unbound-method */
const LOG_ARGS = ['test'];

describeLeaks('slack logger', async () => {
  itLeaks('should forward debug messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(SlackLogger);
    logger.debug(...LOG_ARGS);
    expect(debug).to.have.callCount(1);
  });

  itLeaks('should forward error messages', async () => {
    const { container, module } = await createContainer();
    const error = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      error,
    }));

    const logger = await container.create(SlackLogger);
    logger.error(...LOG_ARGS);
    expect(error).to.have.callCount(1);
  });

  itLeaks('should forward info messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(SlackLogger);
    logger.info(...LOG_ARGS);
    expect(info).to.have.callCount(1);
  });

  itLeaks('should forward warn messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));

    const logger = await container.create(SlackLogger);
    logger.warn(...LOG_ARGS);
    expect(warn).to.have.callCount(1);
  });
});

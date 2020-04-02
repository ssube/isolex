import { spyLogger } from '@apextoaster/js-utils';
import { LogLevel } from '@slack/logger';
import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../src/BaseService';
import { SlackLogger } from '../../src/logger/SlackLogger';
import { createContainer } from '../helpers/container';

/* tslint:disable:no-unbound-method */
const LOG_ARGS = ['test'];

describe('slack logger', async () => {
  it('should forward debug messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(SlackLogger);
    logger.debug(...LOG_ARGS);
    expect(debug).to.have.callCount(1);
  });

  it('should forward error messages', async () => {
    const { container, module } = await createContainer();
    const error = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      error,
    }));

    const logger = await container.create(SlackLogger);
    logger.error(...LOG_ARGS);
    expect(error).to.have.callCount(1);
  });

  it('should forward info messages', async () => {
    const { container, module } = await createContainer();
    const info = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      info,
    }));

    const logger = await container.create(SlackLogger);
    logger.info(...LOG_ARGS);
    expect(info).to.have.callCount(1);
  });

  it('should forward warn messages', async () => {
    const { container, module } = await createContainer();
    const warn = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      warn,
    }));

    const logger = await container.create(SlackLogger);
    logger.warn(...LOG_ARGS);
    expect(warn).to.have.callCount(1);
  });

  it('should store log level', async () => {
    const { container } = await createContainer();
    const logger = await container.create(SlackLogger);
    logger.setLevel(LogLevel.WARN);
    expect(logger.getLevel()).to.equal(LogLevel.WARN);
  });
});

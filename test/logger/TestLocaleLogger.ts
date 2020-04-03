import { spyLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { spy } from 'sinon';

import { INJECT_LOGGER } from '../../src/BaseService';
import { LocaleLogger } from '../../src/logger/LocaleLogger';
import { createContainer } from '../helpers/container';

/* tslint:disable:no-unbound-method */
const LOG_ARGS = ['test'];

describe('locale logger', async () => {
  it('should forward error messages', async () => {
    const { container, module } = await createContainer();
    const error = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      error,
    }));

    const logger = await container.create(LocaleLogger);
    logger.error(LOG_ARGS);
    expect(error).to.have.callCount(1);
  });

  it('should forward debug messages', async () => {
    const { container, module } = await createContainer();
    const debug = spy();
    module.bind(INJECT_LOGGER).toInstance(spyLogger({
      debug,
    }));

    const logger = await container.create(LocaleLogger);
    logger.log(LOG_ARGS);
    expect(debug).to.have.callCount(1);
  });

  it('should forward warn messages', async () => {
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

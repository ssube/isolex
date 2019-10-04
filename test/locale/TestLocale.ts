import { expect } from 'chai';

import { INJECT_LOGGER, INJECT_SCHEMA } from '../../src/BaseService';
import { Locale } from '../../src/locale';
import { ServiceModule } from '../../src/module/ServiceModule';
import { Schema } from '../../src/schema';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';
import { getTestLogger } from '../helpers/logger';

describeLeaks('locale service', async () => {
  itLeaks('should load a default locale', async () => {
    const { container, module } = await createContainer(new ServiceModule({
      timeout: 10,
    }));
    module.bind(INJECT_LOGGER).toInstance(getTestLogger());
    module.bind(INJECT_SCHEMA).toInstance(new Schema());

    const locale = await container.create(Locale, {
      data: {
        lang: 'en',
      },
      metadata: {
        kind: 'locale',
        name: 'test-locale',
      },
    });
    await locale.start();

    expect(locale.lang).to.equal('en');
  });

  itLeaks('should translate a test key', async () => {
    const { container, module } = await createContainer(new ServiceModule({
      timeout: 10,
    }));
    module.bind(INJECT_LOGGER).toInstance(getTestLogger());
    module.bind(INJECT_SCHEMA).toInstance(new Schema());

    const locale = await container.create(Locale, {
      data: {
        lang: 'en',
      },
      metadata: {
        kind: 'locale',
        name: 'test-locale',
      },
    });
    await locale.start();

    expect(locale.translate('test')).to.equal('hello world!');
  });
});

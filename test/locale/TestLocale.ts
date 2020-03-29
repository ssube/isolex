import { expect } from 'chai';

import { Locale } from '../../src/locale';
import { ServiceModule } from '../../src/module/ServiceModule';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

describeLeaks('locale service', async () => {
  itLeaks('should load a default locale', async () => {
    const { container } = await createContainer(new ServiceModule({
      timeout: 10,
    }));

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
    const { container } = await createContainer(new ServiceModule({
      timeout: 10,
    }));

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

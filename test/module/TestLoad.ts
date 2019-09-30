import { expect } from 'chai';

import { BotData } from '../../src/Bot';
import { loadModules } from '../../src/module';
import { describeLeaks, itLeaks } from '../helpers/async';
import { getTestLogger } from '../helpers/logger';

describeLeaks('module helpers', async () => {
  describeLeaks('main module helper', async () => {
    itLeaks('should instatiate preset modules');
    itLeaks('should append passed modules');
  });

  describeLeaks('load plugin module helper', async () => {
    xit('should load a plugin module', async () => {
      const data = {
        modules: [{
          export: 'example-module',
          require: 'isolex-oot-example',
        }],
      };
      const modules = await loadModules({
        data: data as BotData,
        metadata: {
          kind: '',
          name: '',
        },
      }, getTestLogger(true));
      expect(modules.length).to.equal(1);
    });

    itLeaks('should handle errors while loading plugin modules', async () => {
      const data = {
        modules: [{
          export: 'default',
          require: 'isolex-oot-missing',
        }],
      };
      expect(loadModules({
        data: data as BotData,
        metadata: {
          kind: '',
          name: '',
        },
      }, getTestLogger())).to.eventually.deep.equal([]);
    });
  });
});

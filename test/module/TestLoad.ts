import { getTestLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { BotData } from '../../src/Bot';
import { loadModules } from '../../src/module';

describe('main module helper', async () => {
  it('should instatiate preset modules');
  it('should append passed modules');
});

describe('load plugin module helper', async () => {
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
    }, getTestLogger());
    expect(modules.length).to.equal(1);
  });

  it('should handle errors while loading plugin modules', async () => {
    const data = {
      modules: [{
        export: 'default',
        require: 'isolex-oot-missing',
      }],
    };
    return expect(loadModules({
      data: data as BotData,
      metadata: {
        kind: '',
        name: '',
      },
    }, getTestLogger())).to.eventually.deep.equal([]);
  });
});

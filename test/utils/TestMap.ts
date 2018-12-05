import { expect } from 'chai';

import { dictToMap } from 'src/utils/Map';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('utils', async () => {
  describeAsync('map', async () => {
    itAsync('convert objects to maps', async () => {
      const map = dictToMap({
        bar: '2',
        foo: '1',
      });

      expect(Array.from(map.entries())).to.deep.equal([['bar', '2'], ['foo', '1']]);
    });
  });
});

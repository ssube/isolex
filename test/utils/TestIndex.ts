import { expect } from 'chai';

import { normalizeMap } from 'src/utils';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('utils', async () => {
  itAsync('convert objects to maps', async () => {
    const map = normalizeMap({
      bar: '2',
      foo: '1',
    });

    expect(Array.from(map.entries())).to.deep.equal([['bar', '2'], ['foo', '1']]);
  });
});

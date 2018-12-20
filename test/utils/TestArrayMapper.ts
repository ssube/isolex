import { expect } from 'chai';

import { ArrayMapper } from 'src/utils/ArrayMapper';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('utils', async () => {
  describeAsync('array mapper', async () => {
    itAsync('should take initial args', async () => {
      const mapper = new ArrayMapper({
        rest: 'others',
        skip: 0,
        take: ['first', 'second'],
      });
      const results = mapper.map(['1', '2', '3', '4']);

      expect(results.get('first'), 'args should be collected').to.deep.equal(['1']);
      expect(results.get('second'), 'second should be collected').to.deep.equal(['2']);
      expect(results.get('others'), 'rest should be collected').to.deep.equal(['3', '4']);
    });

    itAsync('should always include rest arg', async () => {
      const mapper = new ArrayMapper({
        rest: 'empty',
        skip: 0,
        take: ['first', 'second'],
      });
      const results = mapper.map(['1', '2']);
      expect(results, 'all keys should be present').to.have.all.keys('first', 'second', 'empty');
      expect(results.get('empty'), 'rest key should be empty').to.have.lengthOf(0);
    });
  });
});

import { expect } from 'chai';

import { ArrayMapper } from '../../src/utils/ArrayMapper';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('utils', async () => {
  describeLeaks('array mapper', async () => {
    itLeaks('should take initial args', async () => {
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

    itLeaks('should always include rest arg', async () => {
      const mapper = new ArrayMapper({
        rest: 'empty',
        skip: 0,
        take: ['first', 'second'],
      });
      const results = mapper.map(['1', '2']);
      expect(results, 'all keys should be present').to.have.all.keys('first', 'second', 'empty');
      expect(results.get('empty'), 'rest key should be empty').to.have.lengthOf(0);
    });

    itLeaks('should skit initial args', async () => {
      const mapper = new ArrayMapper({
        rest: 'empty',
        skip: 3,
        take: ['first'],
      });
      const results = mapper.map(['1', '2', '3', '4']);
      expect(results.get('first'), 'first key should take fourth element').to.deep.equal(['4']);
    });
  });
});

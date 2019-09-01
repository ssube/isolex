import { expect } from 'chai';

import { NotFoundError } from '../../src/error/NotFoundError';
import { getHead, getHeadOrDefault, makeMap, mustGet } from '../../src/utils/Map';
import { describeAsync, itAsync } from '../helpers/async';

const mapKey = 'key';
const mapValue = 'value';
const singleItem = new Map([[mapKey, mapValue]]);
const multiItem = new Map([[mapKey, [mapValue]]]);

describeAsync('map utils', async () => {
  describeAsync('dict to map', async () => {
    itAsync('should convert objects to maps', async () => {
      const data = {
        bar: '2',
        foo: '1',
      };
      const map = makeMap(data);

      expect(Array.from(map.entries())).to.deep.equal(Object.entries(data));
    });
  });

  describeAsync('must get helper', async () => {
    itAsync('should get existing keys', async () => {
      expect(mustGet(singleItem, mapKey)).to.equal(mapValue);
    });

    itAsync('should throw on missing keys', async () => {
      expect(() => {
        mustGet(singleItem, 'nope');
      }).to.throw(NotFoundError);
    });
  });

  describeAsync('get head helper', async () => {
    itAsync('should get the first item from existing keys', async () => {
      expect(getHead(multiItem, mapKey)).to.equal(mapValue);
    });

    itAsync('should throw on missing keys', async () => {
      expect(() => {
        getHead(multiItem, 'nope');
      }).to.throw(NotFoundError);
    });
  });

  describeAsync('get head or default helper', async () => {
    itAsync('should get the first item from existing keys', async () => {
      expect(getHeadOrDefault(multiItem, mapKey, 'nope')).to.equal(mapValue);
    });

    itAsync('should get the default for missing keys', async () => {
      expect(getHeadOrDefault(multiItem, 'nope', mapValue)).to.equal(mapValue);
    });
  });
});

import { expect } from 'chai';

import { NotFoundError } from '../../src/error/NotFoundError';
import { getHead, getHeadOrDefault, getOrDefault, makeDict, makeMap, mustGet } from '../../src/utils/Map';
import { describeAsync, itAsync } from '../helpers/async';

const DEFAULT_VALUE = 'default';
const mapKey = 'key';
const mapValue = 'value';
const singleItem = new Map([[mapKey, mapValue]]);
const multiItem = new Map([[mapKey, [mapValue]]]);

describeAsync('map utils', async () => {
  describeAsync('make dict', async () => {
    itAsync('should return an empty dict for nil values', async () => {
      /* tslint:disable-next-line:no-null-keyword */
      expect(makeDict(null)).to.deep.equal({});
      expect(makeDict(undefined)).to.deep.equal({});
    });
  });

  describeAsync('make map', async () => {
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

    xit('should return the default for nil values');
  });

  describe('get or default helper', () => {
    it('should get the item for existing keys', () => {
      expect(getOrDefault(singleItem, mapKey, DEFAULT_VALUE)).to.equal(mapValue);
    });

    it('should get the item for missing keys', () => {
      expect(getOrDefault(singleItem, 'missing', DEFAULT_VALUE)).to.equal(DEFAULT_VALUE);
    });

    xit('should return the default for nil values');
    xit('should return falsy values for existing keys');
  });
});

import { expect } from 'chai';

import { NotFoundError } from '../../src/error/NotFoundError';
import {
  entriesOf,
  getHead,
  getHeadOrDefault,
  getOrDefault,
  makeDict,
  makeMap,
  mustGet,
  pairsToMap,
} from '../../src/utils/Map';
import { describeLeaks, itLeaks } from '../helpers/async';

const DEFAULT_VALUE = 'default';
const mapKey = 'key';
const mapValue = 'value';
const singleItem = new Map([[mapKey, mapValue]]);
const multiItem = new Map([
  [mapKey, [mapValue]],
  // tslint:disable
  ['nilKey', null as any],
  ['nilValue', [null]],
  // tslint:enable
]);

describeLeaks('map utils', async () => {
  describeLeaks('make dict', async () => {
    itLeaks('should return an empty dict for nil values', async () => {
      /* tslint:disable-next-line:no-null-keyword */
      expect(makeDict(null)).to.deep.equal({});
      expect(makeDict(undefined)).to.deep.equal({});
    });

    itLeaks('should return an existing dict', async () => {
      const input = {};
      expect(makeDict(input)).to.equal(input);
    });
  });

  describeLeaks('make map', async () => {
    itLeaks('should convert objects to maps', async () => {
      const data = {
        bar: '2',
        foo: '1',
      };
      const map = makeMap(data);

      expect(Array.from(map.entries())).to.deep.equal(Object.entries(data));
    });
  });

  describeLeaks('must get helper', async () => {
    itLeaks('should get existing keys', async () => {
      expect(mustGet(singleItem, mapKey)).to.equal(mapValue);
    });

    itLeaks('should throw on missing keys', async () => {
      expect(() => {
        mustGet(singleItem, 'nope');
      }).to.throw(NotFoundError);
    });
  });

  describeLeaks('get head helper', async () => {
    itLeaks('should get the first item from existing keys', async () => {
      expect(getHead(multiItem, mapKey)).to.equal(mapValue);
    });

    itLeaks('should throw on missing keys', async () => {
      expect(() => {
        getHead(multiItem, 'nope');
      }).to.throw(NotFoundError);
    });
  });

  describeLeaks('get head or default helper', async () => {
    itLeaks('should get the first item from existing keys', async () => {
      expect(getHeadOrDefault(multiItem, mapKey, 'nope')).to.equal(mapValue);
    });

    itLeaks('should get the default for missing keys', async () => {
      expect(getHeadOrDefault(multiItem, 'nope', mapValue)).to.equal(mapValue);
    });

    itLeaks('should return the default value for nil values', async () => {
      expect(getHeadOrDefault(multiItem, 'nilValue', mapValue)).to.equal(mapValue);
    });

    itLeaks('should return the default value for nil keys', async () => {
      expect(getHeadOrDefault(multiItem, 'nilKey', mapValue)).to.equal(mapValue);
    });
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

  describe('pairs to map helper', () => {
    it('should convert pairs', () => {
      const result = pairsToMap([{
        name: 'foo',
        value: 3,
      }]);
      expect(result.get('foo')).to.equal(3);
    });
  });

  describe('entries of helper', () => {
    it('should return entries for maps', () => {
      const input: Array<[string, number]> = [['foo', 1], ['bar', 3]];
      const value = new Map(input);
      const result = entriesOf(value);
      expect(result.length).to.equal(2);
      expect(result).to.deep.equal(input);
    });

    it('should return entries for objects', () => {
      const result = entriesOf({
        bar: 3,
        foo: 1,
      });
      expect(result.length).to.equal(2);
      expect(result[0][0]).to.equal('bar');
    });

    it('should return empty entries for nil values', () => {
      // tslint:disable-next-line:no-null-keyword
      expect(entriesOf(null)).to.deep.equal([]);
      expect(entriesOf(undefined)).to.deep.equal([]);
    });
  });
});

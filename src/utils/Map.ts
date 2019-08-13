import { isMap, isNil } from 'lodash';

import { NotFoundError } from 'src/error/NotFoundError';
import { doesExist, mergeList, mustExist } from 'src/utils';

export interface Dict<TVal> {
  [key: string]: TVal;
}

/**
 * A `Map` or dictionary object with string keys and `TVal` values.
 */
export type MapLike<TVal> = Map<string, TVal> | Dict<TVal>;

/**
 * Get an element from a Map and guard against nil values.
 */
export function mustGet<TKey, TVal>(map: Map<TKey, TVal>, key: TKey): TVal {
  const val = map.get(key);
  return mustExist(val);
}

export function getOrDefault<TKey, TVal>(map: Map<TKey, TVal>, key: TKey, defaultValue: TVal): TVal {
  if (map.has(key)) {
    const data = map.get(key);
    if (doesExist(data)) {
      return data;
    }
  }

  return defaultValue;
}

export function getHead<TKey, TVal>(map: Map<TKey, Array<TVal>>, key: TKey): TVal {
  const value = map.get(key);
  if (isNil(value) || value.length === 0) {
    throw new NotFoundError();
  }
  return value[0];
}

export function getHeadOrDefault<TKey, TVal>(map: Map<TKey, Array<TVal>>, key: TKey, defaultValue: TVal): TVal {
  if (map.has(key)) {
    const data = map.get(key);
    if (isNil(data)) {
      return defaultValue;
    } else {
      const [head = defaultValue] = data;
      return head;
    }
  } else {
    return defaultValue;
  }
}

/**
 * Set a map key to a new array or push to the existing value.
 * @param map The destination map and source of existing values.
 * @param key The key to get and set.
 * @param val The value to add.
 */
export function setOrPush<TKey, TVal>(map: Map<TKey, Array<TVal>>, key: TKey, val: TVal | Array<TVal>) {
  const prev = map.get(key);
  if (doesExist(prev)) {
    map.set(key, mergeList(prev, val));
  } else {
    if (Array.isArray(val)) {
      map.set(key, val);
    } else {
      map.set(key, [val]);
    }
  }
}

export function pushMergeMap<TKey, TVal>(...args: Array<Map<TKey, TVal | Array<TVal>>>): Map<TKey, Array<TVal>> {
  const out = new Map();
  for (const arg of args) {
    for (const [key, val] of arg) {
      setOrPush(out, key, val);
    }
  }
  return out;
}

/**
 * Clone a map or map-like object into a new map.
 */
export function makeMap<TVal>(val: MapLike<TVal> | null | undefined): Map<string, TVal> {
  // nil: empty map
  if (isNil(val)) {
    return new Map();
  }

  // already a map: make a copy
  if (isMap(val)) {
    return new Map(val.entries());
  }

  // otherwise: dict
  return new Map(Object.entries(val));
}

/**
 * Turns a map or dict into a dict
 */
export function makeDict<TVal>(map: MapLike<TVal> | null | undefined): Dict<TVal> {
  if (isNil(map)) {
    return {};
  }

  if (isMap(map)) {
    const result: Dict<TVal> = {};
    for (const [key, val] of map) {
      result[key] = val;
    }
    return result;
  }

  return map;
}

export interface NameValuePair<TVal> {
  name: string;
  value: TVal;
}

export function pairsToMap<TVal>(pairs: Array<NameValuePair<TVal>> | undefined): Map<string, TVal> {
  const map = new Map();
  if (doesExist(pairs)) {
    for (const p of pairs) {
      map.set(p.name, p.value);
    }
  }
  return map;
}

export function dictValuesToArrays<TVal>(map: MapLike<TVal>): Dict<Array<TVal>> {
  const data: Dict<Array<TVal>> = {};
  for (const [key, value] of makeMap(map)) {
    if (Array.isArray(value)) {
      data[key] = value;
    } else {
      data[key] = [value];
    }
  }

  return data;
}

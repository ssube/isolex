import { isMap, isNil } from 'lodash';

import { NotFoundError } from 'src/error/NotFoundError';

export interface Dict<TVal> {
  [key: string]: TVal;
}

/**
 * A `Map` or dictionary object with string keys and `TVal` values.
 */
export type MapOrMapLike<TVal> = Map<string, TVal> | Dict<TVal>;

/**
 * Resolve after a set amount of time.
 */
export function defer<T = undefined>(ms: number, val?: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => res(val), ms);
  });
}

export function leftPad(val: string, min: number = 8, fill: string = '0'): string {
  if (val.length < min) {
    const pre = Array(min - val.length).fill(fill).join('');
    return `${pre}${val}`;
  } else {
    return val;
  }
}

/**
 * Calculate the "length" of an array or single value.
 *
 * Arrays return their length, single values return 1, and missing values return 0. This counts the number
 * of elements that setOrPush would add.
 */
export function countList(val: any): number {
  if (Array.isArray(val)) {
    return val.length;
  }

  if (!isNil(val)) {
    return 1;
  }

  return 0;
}

/**
 * Remove any null or undefined items from the list.
 */
export function filterNil<TItem>(list: ArrayLike<TItem | null | undefined>): Array<TItem> {
  function nilGuard(val: TItem | null | undefined): val is TItem {
    return !isNil(val);
  }
  return Array.from(list).filter(nilGuard);
}

/**
 * Merge arguments, which may or may not be arrays, into one return that is definitely an array.
 */
export function mergeList<TVal extends TItem | Array<TItem>, TItem>(...parts: Array<TVal>): Array<TItem> {
  const out = [];

  for (const part of parts) {
    if (Array.isArray(part)) {
      out.push(...part);
    } else {
      out.push(part);
    }
  }

  return out;
}

export function mustFind<TVal>(list: Array<TVal>, predicate: (val: TVal, idx: number, list: Array<TVal>) => boolean): TVal {
  const val = list.find(predicate);
  if (isNil(val)) {
    throw new NotFoundError();
  }
  return val;
}

/**
 * Get an element from a Map and guard against nil values.
 */
export function mustGet<TKey, TVal>(map: Map<TKey, TVal>, key: TKey): TVal {
  const val = map.get(key);
  if (isNil(val)) {
    throw new NotFoundError();
  }
  return val;
}

export function getOrDefault<TKey, TVal>(map: Map<TKey, TVal>, key: TKey, defaultValue: TVal): TVal {
  if (map.has(key)) {
    const data = map.get(key);
    if (isNil(data)) {
      return defaultValue;
    } else {
      return data;
    }
  } else {
    return defaultValue;
  }
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
  if (prev) {
    map.set(key, mergeList(prev, val));
  } else {
    if (Array.isArray(val)) {
      map.set(key, val);
    } else {
      map.set(key, [val]);
    }
  }
}

export function mergeMap<TKey, TVal>(...args: Array<Map<TKey, TVal | Array<TVal>>>): Map<TKey, Array<TVal>> {
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
export function dictToMap<TVal>(val: MapOrMapLike<TVal> | null | undefined): Map<string, TVal> {
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
export function mapToDict<TVal>(map: MapOrMapLike<TVal> | null | undefined): Dict<TVal> {
  if (isNil(map)) {
    return {};
  }

  const result: Dict<TVal> = {};
  if (isMap(map)) {
    for (const [key, val] of map) {
      result[key] = val;
    }
  } else {
    for (const [key, val] of Object.entries(map)) {
      result[key] = val;
    }
  }

  return result;
}

export function dictValuesToArrays<TVal>(map: MapOrMapLike<TVal>): Dict<Array<TVal>> {
  const data: Dict<Array<TVal>> = {};
  for (const [key, value] of dictToMap(map)) {
    if (Array.isArray(value)) {
      data[key] = value;
    } else {
      data[key] = [value];
    }
  }
  return data;
}

export function getConstructor(val: any) {
  return val.constructor;
}

export function prototypeName(val: any) {
  return getConstructor(Reflect.getPrototypeOf(val)).name;
}

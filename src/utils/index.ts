import { isMap, isNil } from 'lodash';

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

export function mapToDict<TVal>(map: Map<string, TVal>): Dict<TVal> {
  function reducer(prev: Dict<TVal>, [key, val]: [string, TVal]): Dict<TVal> {
    return {...prev, [key]: val};
  }
  return Array.from(map.entries()).reduce(reducer, {});
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
export function normalizeMap<TVal>(val: MapOrMapLike<TVal>): Map<string, TVal> {
  if (isMap(val)) {
    return new Map(val.entries());
  } else {
    return new Map(Object.entries(val));
  }
}

export function prototypeName(val: any) {
  return Reflect.getPrototypeOf(val).constructor.name;
}

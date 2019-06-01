import { isFunction, isNil } from 'lodash';

import { NotFoundError } from 'src/error/NotFoundError';

export function leftPad(val: string, min: number = 8, fill: string = '0'): string {
  if (val.length < min) {
    const len = min - val.length;
    const pre = Array(len).fill(fill).join('').slice(0, len);
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
export function countList(val: unknown): number {
  if (Array.isArray(val)) {
    return val.length;
  }

  if (doesExist(val)) {
    return 1;
  }

  return 0;
}

/**
 * Remove any null or undefined items from the list.
 */
export function filterNil<TItem>(list: ArrayLike<TItem | null | undefined>): Array<TItem> {
  return Array.from(list).filter(doesExist);
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
  return mustExist(val);
}

export function getConstructor(val: object) {
  return val.constructor;
}

export function prototypeName(val: object) {
  return getConstructor(Reflect.getPrototypeOf(val)).name;
}

export function getMethods<TValue extends object>(value: TValue): Set<Function> {
  const methods = new Set<Function>();

  for (const name of Object.getOwnPropertyNames(value)) {
    const desc = Object.getOwnPropertyDescriptor(value, name);
    if (isNil(desc)) {
      continue;
    }

    const method = desc.value;
    if (isFunction(method)) {
      methods.add(method);
    }
  }

  const proto = Reflect.getPrototypeOf(value);
  if (proto !== value && doesExist(proto)) {
    for (const m of getMethods(proto)) {
      methods.add(m);
    }
  }

  return methods;
}

export function mustExist<T>(val: T | null | undefined): T {
  if (isNil(val)) {
    throw new NotFoundError();
  }

  return val;
}

export function doesExist<T>(val: T | null | undefined): val is T {
  return !isNil(val);
}

export function mustCoalesce<T>(...vals: Array<T | null | undefined>): T {
  for (const v of vals) {
    if (doesExist(v)) {
      return v;
    }
  }

  throw new NotFoundError();
}

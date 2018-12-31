import { isNil } from 'lodash';

import { NotFoundError } from 'src/error/NotFoundError';

/**
 * Resolve after a set amount of time.
 */
export function defer<T = undefined>(ms: number, val?: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(val);
    }, ms);
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
export function countList(val: unknown): number {
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

export function getConstructor(val: any) {
  return val.constructor;
}

export function prototypeName(val: object) {
  return getConstructor(Reflect.getPrototypeOf(val)).name;
}

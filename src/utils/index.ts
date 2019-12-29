import { isNil } from 'lodash';

import { NotFoundError } from '../error/NotFoundError';

/**
 * Unset value.
 */
export type Nil = null | undefined;

/**
 * Value that may be nil.
 */
export type Optional<T> = T | Nil;

/**
 * Comparison (filter) predicate for a single value.
 */
export type PredicateC1<TVal> = (val: TVal, idx: number, list: Array<TVal>) => boolean;

/**
 * Comparison (sort) predicate for two values.
 */
export type PredicateC2<TVal> = (pval: TVal, nval: TVal, idx: number, list: Array<TVal>) => number;

/**
 * Reduction predicate for two values.
 */
export type PredicateR2<TVal> = (pval: TVal, nval: TVal, idx: number, list: Array<TVal>) => TVal;

/**
 * Calculate the "length" of an array or value.
 *
 * Arrays return their length, single values return 1, and nil values return 0.
 * This counts the number of elements that setOrPush would add.
 */
export function countOf(val: unknown): number {
  if (Array.isArray(val)) {
    return val.length;
  }

  if (doesExist(val)) {
    return 1;
  }

  return 0;
}

export function defaultWhen<TVal>(condition: boolean, ...items: Array<TVal>): TVal {
  if (condition) {
    return items[0];
  } else {
    return items[1];
  }
}

/**
 * Remove any null or undefined items from the list.
 */
export function filterNil<TItem>(list: ArrayLike<Optional<TItem>>): Array<TItem> {
  return Array.from(list).filter(doesExist);
}

/**
 * Merge arguments, which may or may not be arrays, into one return that is definitely an array.
 */
export function mergeList<TItem>(...parts: Array<TItem | Array<TItem>>): Array<TItem> {
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
 * Find a value matching the given predicate or throw.
 */
export function mustFind<TVal>(list: Array<Optional<TVal>>, predicate: PredicateC1<TVal>): TVal {
  const val = filterNil(list).find(predicate);
  return mustExist(val);
}

/**
 * Check if a variable is not nil.
 */
export function doesExist<T>(val: Optional<T>): val is T {
  return !isNil(val);
}

/**
 * Assert that a variable is not nil and return the value.
 *
 * @throws NotFoundError
 * @returns val
 */
export function mustExist<T>(val: Optional<T>): T {
  if (isNil(val)) {
    throw new NotFoundError();
  }

  return val;
}

/**
 * Return the first value that is not nil.
 */
export function mustCoalesce<T>(...values: Array<Optional<T>>): T {
  return mustFind(values, doesExist);
}

import { BaseError } from 'noicejs';

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

/**
 * Reject after a set amount of time if the original promise has not yet resolved.
 */
export function timeout<T>(ms: number, oper: Promise<T>): Promise<T> {
  const limit = new Promise<T>((res, rej) => {
    setTimeout(() => {
      rej(new BaseError('operation timed out'));
    }, ms);
  });

  return Promise.race([limit, oper]);
}

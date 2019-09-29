import { TimeoutError } from '../error/TimeoutError';

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
      rej(new TimeoutError());
    }, ms);
  });

  return Promise.race([limit, oper]);
}

export async function waitFor(cb: () => boolean, step: number, count: number): Promise<void> {
  let accum = 0;
  while (accum < count) {
    await defer(step);
    if (cb()) {
      return;
    }
    accum += 1;
  }

  throw new TimeoutError();
}

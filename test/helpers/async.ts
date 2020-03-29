import { AsyncHook, createHook } from 'async_hooks';
import { AsyncTracker, isDebug, isNil } from '@apextoaster/js-utils';

// this will pull Mocha internals out of the stacks
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { stackTraceFilter } = require('mocha/lib/utils');
const filterStack = stackTraceFilter();

type AsyncMochaTest = (this: Mocha.Context | void) => Promise<void>;
type AsyncMochaSuite = (this: Mocha.Suite) => Promise<void>;

/**
 * Describe a suite of async tests. This wraps mocha's describe to track async resources and report leaks.
 */
export function describeLeaks(description: string, cb: AsyncMochaSuite): Mocha.Suite {
  return describe(description, function trackSuite(this: Mocha.Suite) {
    const tracker = new AsyncTracker();

    beforeEach(() => {
      tracker.enable();
    });

    afterEach(() => {
      tracker.disable();
      const leaked = tracker.size;

      // @TODO: this should only exclude the single Immediate set by the Tracker
      if (leaked > 1) {
        tracker.dump();
        const msg = `test leaked ${leaked - 1} async resources`;
        if (isDebug()) {
          throw new Error(msg);
        } else {
          /* eslint-disable-next-line no-console */
          console.warn(msg);
        }
      }

      tracker.clear();
    });

    /* eslint-disable-next-line no-invalid-this */
    const suite: PromiseLike<void> | undefined = cb.call(this);
    if (isNil(suite) || !Reflect.has(suite, 'then')) {
      /* eslint-disable-next-line no-console */
      console.error(`test suite '${description}' did not return a promise`);
    }

    return suite;
  });
}

/**
 * Run an asynchronous test with unhandled rejection  guards.
 *
 * This function may not have any direct test coverage. It is too simple to reasonably mock.
 */
export function itLeaks(expectation: string, cb?: AsyncMochaTest): Mocha.Test {
  if (isNil(cb)) {
    return it(expectation);
  }

  return it(expectation, function trackTest(this: Mocha.Context) {
    return new Promise<unknown>((res, rej) => {
      /* eslint-disable-next-line no-invalid-this */
      cb.call(this).then((value: unknown) => {
        res(value);
      }, (err: Error) => {
        rej(err);
      });
    });
  });
}

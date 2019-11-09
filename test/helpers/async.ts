import { AsyncHook, createHook } from 'async_hooks';
import { isNil } from 'lodash';

// this will pull Mocha internals out of the stacks
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { stackTraceFilter } = require('mocha/lib/utils');
const filterStack = stackTraceFilter();

type AsyncMochaTest = (this: Mocha.Context | void) => Promise<void>;
type AsyncMochaSuite = (this: Mocha.Suite) => Promise<void>;

export interface TrackedResource {
  source: string;
  triggerAsyncId: number;
  type: string;
}

function debugMode() {
  return Reflect.has(process.env, 'DEBUG');
}

/**
 * Async resource tracker using  node's internal hooks.
 *
 * This probably won't work in a browser. It does not hold references to the resource, to avoid leaks.
 * Adapted from https://gist.github.com/boneskull/7fe75b63d613fa940db7ec990a5f5843#file-async-dump-js
 */
export class Tracker {
  public static getStack(): string {
    const err = new Error();
    if (isNil(err.stack)) {
      return 'no stack trace available';
    } else {
      return filterStack(err.stack);
    }
  }

  private readonly hook: AsyncHook;
  private readonly resources: Map<number, TrackedResource>;

  constructor() {
    this.resources = new Map();
    this.hook = createHook({
      destroy: (id: number) => {
        this.resources.delete(id);
      },
      init: (id: number, type: string, triggerAsyncId: number) => {
        const source = Tracker.getStack();
        // @TODO: exclude async hooks, including this one
        this.resources.set(id, {
          source,
          triggerAsyncId,
          type,
        });
      },
      promiseResolve: (id: number) => {
        this.resources.delete(id);
      },
    });
  }

  public clear() {
    this.resources.clear();
  }

  public disable() {
    this.hook.disable();
  }

  /* eslint-disable no-console, no-invalid-this */
  public dump() {
    console.error(`tracking ${this.resources.size} async resources`);
    this.resources.forEach((res, id) => {
      console.error(`${id}: ${res.type}`);
      if (debugMode()) {
        console.error(res.source);
        console.error('\n');
      }
    });
  }

  public enable() {
    this.hook.enable();
  }

  public get size(): number {
    return this.resources.size;
  }
}

/**
 * Describe a suite of async tests. This wraps mocha's describe to track async resources and report leaks.
 */
export function describeLeaks(description: string, cb: AsyncMochaSuite): Mocha.Suite {
  return describe(description, function trackSuite(this: Mocha.Suite) {
    const tracker = new Tracker();

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
        if (debugMode()) {
          throw new Error(msg);
        } else {
          /* eslint-disable-next-line no-console */
          console.warn(msg);
        }
      }

      tracker.clear();
    });

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
      cb.call(this).then((value: unknown) => {
        res(value);
      }, (err: Error) => {
        rej(err);
      });
    });
  });
}

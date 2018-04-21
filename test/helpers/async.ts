import {AsyncHook, createHook} from 'async_hooks';
import {expect} from 'chai';

// this will pull Mocha internals out of the stacks
// tslint:disable-next-line:no-var-requires
const {stackTraceFilter} = require('mocha/lib/utils');
const filterStack = stackTraceFilter();

type AsyncMochaTest = (this: Mocha.ITestCallbackContext | void, done: MochaDone) => Promise<void>;
type AsyncMochaSuite = (this: Mocha.ISuiteCallbackContext) => Promise<void>;

const UNHANDLED_REJECTION = 'unhandledRejection';

export function describeAsync(description: string, cb: AsyncMochaSuite): Mocha.ISuite {
  return describe(description, function trackSuite() {
    const tracker = new Tracker();

    beforeEach(() => {
      tracker.enable();
    });

    afterEach(() => {
      tracker.disable();
      const leaked = tracker.size;

      // @todo: this should only exclude the single Immediate set by the Tracker
      if (leaked > 1) {
        tracker.dump();
        throw new Error(`test leaked ${leaked - 1} async resources`);
      }

      tracker.clear();
    });

    const suite: PromiseLike<void> | undefined = cb.call(this);
    if (!suite || !suite.then) {
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
export function itAsync(expectation: string, cb?: AsyncMochaTest): Mocha.ITest {
  if (cb) {
    return it(expectation, function trackTest(this: any) {
      return new Promise((res, rej) => {
        cb.call(this).then((value: any) => {
          res();
        }, (err: Error) => {
          rej(err);
        });
      });
    });
  } else {
    return it(expectation);
  }
}

export function delay(ms: number) {
  return new Promise((res) => setTimeout(() => res(), ms));
}

export interface TrackedResource {
  source: string;
  triggerAsyncId: number;
  type: string;
}

/**
 * Async resource tracker using  node's internal hooks.
 *
 * This probably won't work in a browser. It does not hold references to the resource, to avoid leaks.
 * Adapted from https://gist.github.com/boneskull/7fe75b63d613fa940db7ec990a5f5843#file-async-dump-js
 */
export class Tracker {
  private hook: AsyncHook;
  private resources: Map<number, TrackedResource>;

  constructor() {
    this.resources = new Map();
    this.hook = createHook({
      destroy: (id: number) => {
        this.resources.delete(id);
      },
      init: (id: number, type: string, triggerAsyncId: number) => {
        const source = filterStack((new Error()).stack || 'unknown');

        // exclude async hooks, including this one
        // if (source.includes('AsyncHook.init')) {
        // return;
        // }

        this.resources.set(id, {
          source,
          triggerAsyncId,
          type
        });
      },
      promiseResolve: (id: number) => {
        this.resources.delete(id);
      }
    });
  }

  public clear() {
    this.resources.clear();
  }

  public disable() {
    this.hook.disable();
  }

  public dump() {
    console.error(`tracking ${this.resources.size} async resources`);
    this.resources.forEach((res, id) => {
      console.error(`id: ${id}`);
      console.error(`type: ${res.type}`);
      console.error(res.source);
      console.error('\n');
    });
  }

  public enable() {
    this.hook.enable();
  }

  public get size(): number {
    return this.resources.size;
  }
}

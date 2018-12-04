import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {ineeda} from 'ineeda';
import * as sinonChai from 'sinon-chai';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: true,
  hookRequire: true,
});

/**
 * This will break the whole test run if any test leaks an unhandled rejection.
 *
 * To ensure only a single test breaks, make sure to wrap each test with the `handleRejection` helper.
 */
process.on('unhandledRejection', (reason, promise) => {
  // tslint:ignore-next-line:no-console
  console.error('unhandled error during tests', reason);
  process.exit(1);
});

chai.use(chaiAsPromised);
chai.use(sinonChai);

/* tslint:disable:no-null-keyword */
ineeda.intercept({
  then: null,
  unsubscribe: null,
});
/* tslint:enable:no-null-keyword */

const context = (require as any).context('.', true, /Test.*$/);
context.keys().forEach(context);
export default context;

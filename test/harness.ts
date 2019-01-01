import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ineeda } from 'ineeda';
import * as sinonChai from 'sinon-chai';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: true,
  hookRequire: true,
});

/**
 * This will break the whole test run if any test leaks an unhandled rejection.
 */
process.on('unhandledRejection', (reason, promise) => {
  // tslint:disable-next-line:no-console
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

// enable source context inclusion when https://github.com/istanbuljs/nyc/issues/953 is resolved
// const srcContext = (require as any).context('../src', true, /.*ts$/);
// srcContext.keys().forEach(srcContext);

// tslint:disable-next-line:no-any
const testContext = (require as any).context('../test', true, /Test.*$/);
testContext.keys().forEach(testContext);
// tslint:disable-next-line:no-default-export
export default testContext;

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {ineeda} from 'ineeda';
import * as sinonChai from 'sinon-chai';

/**
 * This will break the whole test run if any test leaks an unhandled rejection.
 *
 * To ensure only a single test breaks, make sure to wrap each test with the `handleRejection` helper.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandled error during tests', reason);
  process.exit(1);
});

chai.use(chaiAsPromised);
chai.use(sinonChai);

ineeda.intercept({
  then: null,
  unsubscribe: null
});

const context = (require as any).context('.', true, /Test.*$/);
context.keys().forEach(context);
export default context;

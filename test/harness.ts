import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ineeda } from 'ineeda';
import * as sinonChai from 'sinon-chai';
import * as sourceMapSupport from 'source-map-support';

import { BotModule } from '../src/module/BotModule';
import { EntityModule } from '../src/module/EntityModule';
import { FilterModule } from '../src/module/FilterModule';
import { IntervalModule } from '../src/module/IntervalModule';
import { MigrationModule } from '../src/module/MigrationModule';
import { ParserModule } from '../src/module/ParserModule';
import { ServiceModule } from '../src/module/ServiceModule';
import { TransformModule } from '../src/module/TransformModule';

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

// TODO: replace ineeda with sinon mocks (#327)
/* tslint:disable:no-null-keyword */
ineeda.intercept({
  then: null as any,
  unsubscribe: null as any,
});
/* tslint:enable:no-null-keyword */

// enable source context inclusion when https://github.com/istanbuljs/nyc/issues/953 is resolved
// tslint:disable-next-line:no-any
// const srcContext = (require as any).context('../src', true, /\/(?!main|shim).+\.ts$/m);
// srcContext.keys().forEach(srcContext);

const modules = [
  BotModule,
  EntityModule,
  FilterModule,
  IntervalModule,
  MigrationModule,
  ParserModule,
  ServiceModule,
  TransformModule,
];

// tslint:disable-next-line:no-any
const testContext = (require as any).context('../test', true, /Test.*$/);
testContext.keys().forEach(testContext);
// tslint:disable-next-line:no-default-export
export default testContext;

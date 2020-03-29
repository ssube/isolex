import { ChildProcessError, waitForChild } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ChildProcessByStdio, ChildProcessWithoutNullStreams } from 'child_process';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';
import { match, stub } from 'sinon';
import { Readable } from 'stream';

import { INJECT_CLOCK } from '../../src/BaseService';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { ShellFilter, ShellFilterData } from '../../src/filter/ShellFilter';
import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createChild } from '../helpers/child';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_CONFIG: ShellFilterData = {
  child: {
    args: ['-'],
    command: '/bin/cat',
    cwd: '',
    env: [],
    timeout: 0,
  },
  filters: [],
  strict: false,
};
const TEST_FILTER = 'test-filter';

describeLeaks('shell filter', async () => {
  itLeaks('should execute the given command', async () => {
    const { container } = await createServiceContainer();
    const { child, end, write } = createChild(0);

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      data: TEST_CONFIG,
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.check(ineeda.instanceof(Message));
    /* should have successfully called exec */
    expect(exec).to.have.callCount(1);
    expect(result).to.equal(FilterBehavior.Allow);
    /* and written the payload */
    expect(end).to.have.callCount(1);
    expect(write).to.have.callCount(1);
    expect(write).to.have.been.calledBefore(end);
  });

  itLeaks('should reject the value when command exits with error', async () => {
    const { container } = await createServiceContainer();
    const { child } = createChild(1);

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      data: TEST_CONFIG,
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.check(ineeda.instanceof(Message));
    /* should have unsuccessfully called exec */
    expect(exec).to.have.callCount(1);
    expect(result).to.equal(FilterBehavior.Drop);
  });

  itLeaks('should reject the value when command writes an error', async () => {
    const { container } = await createServiceContainer();
    const child = createChild(0, Buffer.from('this is an error'));

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      data: TEST_CONFIG,
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.check(ineeda.instanceof(Message));
    /* should have unsuccessfully called exec */
    expect(exec).to.have.callCount(1);
    expect(result).to.equal(FilterBehavior.Drop);
  });

  itLeaks('should gracefully handle missing stdin', async () => {
    const { container } = await createServiceContainer();
    const { stdout } = createChild(0);

    /* eslint-disable-next-line @typescript-eslint/ban-types */
    const child = ineeda<ChildProcessByStdio<null, Readable, Readable>>({
      on: stub().withArgs('close', match.func).yields(0),
      stderr: stdout,
      /* getter/setter pair shouldn't be required for proper sinon mock */
      get stdin() {
        /* eslint-disable-next-line no-null/no-null */
        return null;
      },
      /* eslint-disable-next-line @typescript-eslint/ban-types */
      set stdin(stream: null) {
        /* noop */
      },
      stdout,
    });

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      data: TEST_CONFIG,
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.check(ineeda.instanceof(Message));
    expect(exec).to.have.callCount(1);
    expect(result).to.equal(FilterBehavior.Allow);
  });

  itLeaks('should collect output from child', async () => {
    const { stderr, stdin } = createChild(0);

    const TEST_OUTPUT = 'hello world';
    const child = ineeda<ChildProcessWithoutNullStreams>({
      on: stub().withArgs('close', match.func).yields(0),
      stderr,
      stdin,
      stdout: ineeda<Readable>({
        on: stub().withArgs('data', match.func).yields(Buffer.from(TEST_OUTPUT)),
      }),
    });

    const result = await waitForChild(child);
    expect(result.stdout).to.equal(TEST_OUTPUT);
  });

  itLeaks('should handle error events from child', async () => {
    const { stderr, stdin, stdout } = createChild(0);

    const child = ineeda<ChildProcessWithoutNullStreams>({
      on: stub()
        .withArgs('close', match.func).yields(0)
        .withArgs('error', match.func).yields(new BaseError('child process broke')),
      stderr,
      stdin,
      stdout,
    });

    return expect(waitForChild(child)).to.eventually.be.rejectedWith(ChildProcessError);
  });

  itLeaks('should ignore exit status passed as error event', async () => {
    const { stderr, stdin, stdout } = createChild(0);

    const child = ineeda<ChildProcessWithoutNullStreams>({
      on: stub()
        .withArgs('close', match.func).yields(0)
        .withArgs('error', match.func).yields(0),
      stderr,
      stdin,
      stdout,
    });

    const result = await waitForChild(child);
    expect(result.status).to.equal(0);
  });
});

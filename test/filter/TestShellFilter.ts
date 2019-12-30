import { expect } from 'chai';
import { ChildProcessByStdio, ChildProcessWithoutNullStreams } from 'child_process';
import { ineeda } from 'ineeda';
import { stub } from 'sinon';
import { Readable, Writable } from 'stream';

import { INJECT_CLOCK, INJECT_LOGGER } from '../../src/BaseService';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { ShellFilter, ShellFilterData } from '../../src/filter/ShellFilter';
import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestLogger } from '../helpers/logger';

const TEST_CONFIG: ShellFilterData = {
  command: 'cat -',
  filters: [],
  options: {
    cwd: '',
    env: [],
    timeout: 0,
  },
  strict: false,
};
const TEST_FILTER = 'test-filter';

function createChild(status: number) {
  const end = stub().yields();
  const write = stub().yields();
  const stdin = ineeda<Writable>({
    end,
    write,
  });

  const stdout = ineeda<Readable>({
    on: stub(),
  });
  const child = ineeda<ChildProcessWithoutNullStreams>({
    on: stub().withArgs('close').yields(status),
    stderr: stdout,
    stdin,
    stdout,
  });

  return {
    child,
    end,
    stderr: stdout,
    stdin,
    stdout,
    write,
  };
}

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

    const end = stub().yields();
    const write = stub().yields();
    const stdin = ineeda<Writable>({
      end,
      write,
    });

    const stderr = ineeda<Readable>({
      on: stub().withArgs('data').yields(Buffer.from('this is an error')),
    });
    const stdout = ineeda<Readable>({
      on: stub(),
    });
    const child = ineeda<ChildProcessWithoutNullStreams>({
      on: stub().withArgs('close').yields(0),
      stderr,
      stdin,
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
    /* should have unsuccessfully called exec */
    expect(exec).to.have.callCount(1);
    expect(result).to.equal(FilterBehavior.Drop);
  });

  itLeaks('should gracefully handle missing stdin', async () => {
    const { container } = await createServiceContainer();
    const { stdout } = createChild(0);

    const child = ineeda<ChildProcessByStdio<null, Readable, Readable>>({
      on: stub().withArgs('close').yields(0),
      stderr: stdout,
      /* getter/setter pair shouldn't be required for proper sinon mock */
      get stdin() {
        /* eslint-disable-next-line no-null/no-null */
        return null;
      },
      set stdin(stream: null) {
        /* noop */
      },
      stdout,
    });

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      [INJECT_LOGGER]: getTestLogger(true),
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
    expect(result).to.equal(FilterBehavior.Allow);
  });

  itLeaks('should collect output from child', async () => {
    const { container } = await createServiceContainer();
    const { stderr, stdin } = createChild(0);

    const TEST_OUTPUT = 'hello world';
    const child = ineeda<ChildProcessWithoutNullStreams>({
      on: stub().withArgs('close').yields(0),
      stderr,
      stdin,
      stdout: ineeda<Readable>({
        on: stub().withArgs('data').yields(Buffer.from(TEST_OUTPUT)),
      }),
    });

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      [INJECT_LOGGER]: getTestLogger(true),
      data: TEST_CONFIG,
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.waitForChild(child);
    expect(result.stdout).to.equal(TEST_OUTPUT);
  });
});

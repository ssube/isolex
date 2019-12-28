import { expect } from 'chai';
import { ChildProcess, PromiseWithChild } from 'child_process';
import { ineeda } from 'ineeda';
import { stub } from 'sinon';
import { Writable } from 'stream';

import { INJECT_CLOCK } from '../../src/BaseService';
import { Message } from '../../src/entity/Message';
import { FilterBehavior } from '../../src/filter';
import { ChildStreams, ShellFilter } from '../../src/filter/ShellFilter';
import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_FILTER = 'test-filter';

describeLeaks('shell filter', async () => {
  itLeaks('should execute the given command', async () => {
    const { container } = await createServiceContainer();

    /* set up the child with stdin stream */
    const end = stub().yields();
    const write = stub().yields();
    const stdin = ineeda<Writable>({
      end,
      write,
    });

    const child: PromiseWithChild<ChildStreams> = Object.assign(Promise.resolve({
      stderr: '',
      stdout: '',
    }), {
      child: ineeda<ChildProcess>({
        stdin,
      }),
    });

    /* service in test */
    const exec = stub().returns(child);
    const filter = await createService(container, ShellFilter, {
      [INJECT_CLOCK]: await container.create(Clock),
      data: {
        command: 'yes',
        filters: [],
        options: {
          cwd: '',
          env: [],
          timeout: 0,
        },
        strict: false,
      },
      exec,
      metadata: {
        kind: TEST_FILTER,
        name: TEST_FILTER,
      },
    });

    const result = await filter.check(ineeda.instanceof(Message));
    /* should have successfully called exec */
    expect(result).to.equal(FilterBehavior.Allow);
    expect(exec).to.have.callCount(1);
    /* and written the payload */
    expect(end).to.have.callCount(1);
    expect(write).to.have.callCount(1);
    expect(write).to.have.been.calledBefore(end);
  });
});

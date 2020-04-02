import { defer } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseError } from 'noicejs';
import { stub } from 'sinon';

import { INJECT_CLOCK } from '../../../src/BaseService';
import { Clock } from '../../../src/utils/Clock';
import { TimeInterval } from '../../../src/utils/interval/TimeInterval';
import { createServiceContainer } from '../../helpers/container';

const TIME_TIMEOUT = 25;

describe('time interval', async () => {
  it('should call the tick function', async () => {
    const fn = stub().returns(Promise.resolve());
    const { container } = await createServiceContainer();
    const interval = await container.create(TimeInterval, {
      [INJECT_CLOCK]: await container.create(Clock, {}),
      fn,
      freq: {
        time: '20ms',
      },
    });
    await defer(TIME_TIMEOUT);
    await interval.stop();
    expect(fn).to.have.callCount(1);
  });

  it('should set and clear a clock interval');

  it('should handle tick errors', async () => {
    const { container } = await createServiceContainer();
    const interval = await container.create(TimeInterval, {
      [INJECT_CLOCK]: await container.create(Clock, {}),
      fn: () => Promise.reject(new BaseError('test')),
      freq: {
        time: '20ms',
      },
    });
    await defer(TIME_TIMEOUT);
    await interval.stop();
  });
});

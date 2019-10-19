import { expect } from 'chai';
import { stub } from 'sinon';

import { defer } from '../../../src/utils/Async';
import { CronInterval } from '../../../src/utils/interval/CronInterval';
import { describeLeaks, itLeaks } from '../../helpers/async';
import { createServiceContainer } from '../../helpers/container';

const CRON_TIMEOUT = 1200;

describeLeaks('cron interval', async () => {
  itLeaks('should call the tick function', async () => {
    const fn = stub().returns(Promise.resolve());
    const { container } = await createServiceContainer();
    const interval = await container.create(CronInterval, {
      fn,
      freq: {
        cron: '* * * * * *',
      },
    });
    await defer(CRON_TIMEOUT);
    await interval.stop();
    expect(fn).to.have.callCount(1);
  });

  itLeaks('should create and stop a cron job');
});

import { defer } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { stub } from 'sinon';

import { CronInterval } from '../../../src/utils/interval/CronInterval';
import { createServiceContainer } from '../../helpers/container';

const CRON_TIMEOUT = 1200;

describe('cron interval', async () => {
  it('should call the tick function', async () => {
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

  it('should create and stop a cron job');
});

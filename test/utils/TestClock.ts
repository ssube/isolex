import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Container } from 'noicejs';
import { spy } from 'sinon';

import { Clock, NOW_TO_SECONDS } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

const TEST_DATE = 14000000;

describeLeaks('utils', async () => {
  describeLeaks('clock', async () => {
    itLeaks('should get epoch seconds', async () => {
      const clock = new Clock({
        container: ineeda<Container>(),
      });
      expect(clock.getSeconds()).to.be.greaterThan(0);
    });

    itLeaks('should default to date', async () => {
      const { container } = await createContainer();
      const clock = await container.create(Clock);
      expect(clock.date).to.equal(Date);
    });

    itLeaks('should return whole seconds', async () => {
      const { container } = await createContainer();
      const clock = await container.create(Clock);
      const now = clock.getSeconds();
      expect(now).to.equal(Math.floor(now));
    });

    /* tslint:disable:no-any */
    itLeaks('should return the current date', async () => {
      const date = spy() as any;
      const { container } = await createContainer();
      const clock = await container.create(Clock, { date });
      clock.getDate();
      expect(date).to.have.been.calledWithExactly();
    });

    itLeaks('should return a specified date', async () => {
      const date = spy() as any;
      const { container } = await createContainer();
      const clock = await container.create(Clock, { date });
      clock.getDate(TEST_DATE);
      expect(date).to.have.been.calledWith(TEST_DATE * NOW_TO_SECONDS);
    });
  });
});

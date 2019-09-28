import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Container } from 'noicejs';

import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createContainer } from '../helpers/container';

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
  });
});

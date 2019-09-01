import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Container } from 'noicejs';

import { Clock } from '../../src/utils/Clock';
import { describeAsync, itAsync } from '../helpers/async';
import { createContainer } from '../helpers/container';

describeAsync('utils', async () => {
  describeAsync('clock', async () => {
    itAsync('should get epoch seconds', async () => {
      const clock = new Clock({
        container: ineeda<Container>(),
      });
      expect(clock.getSeconds()).to.be.greaterThan(0);
    });

    itAsync('should default to date', async () => {
      const { container } = await createContainer();
      const clock = await container.create(Clock);
      expect(clock.date).to.equal(Date);
    });

    itAsync('should return whole seconds', async () => {
      const { container } = await createContainer();
      const clock = await container.create(Clock);
      const now = clock.getSeconds();
      expect(now).to.equal(Math.floor(now));
    });
  });
});

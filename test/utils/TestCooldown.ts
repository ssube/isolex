import { expect } from 'chai';
import { Container } from 'noicejs';

import { defer } from 'src/utils';
import { Cooldown, CooldownOptions } from 'src/utils/Cooldown';

import { describeAsync, itAsync } from 'test/helpers/async';

const COOLDOWN_STEPS = [10, 10 + 2, 10 + 2 + 4, 10 + 2 + 4 + 8];

describeAsync('utils', async () => {
  describeAsync('cooldown', async () => {
    itAsync('should change the rate by the growth', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
        base: 10,
        grow: 2,
      });

      expect(cd.inc()).to.equal(COOLDOWN_STEPS[1]);
      expect(cd.inc()).to.equal(COOLDOWN_STEPS[2]);
      expect(cd.inc()).to.equal(COOLDOWN_STEPS[3]);
      expect(cd.dec()).to.equal(COOLDOWN_STEPS[2]);
      expect(cd.dec()).to.equal(COOLDOWN_STEPS[1]);
      expect(cd.dec()).to.equal(COOLDOWN_STEPS[0]);
      expect(cd.dec()).to.equal(COOLDOWN_STEPS[0]);
      expect(cd.getRate()).to.equal(COOLDOWN_STEPS[0]);
    });

    itAsync('should stop a pending timer', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
        base: 5000,
        grow: 0,
      });

      await cd.start();
      await cd.stop();
    });

    itAsync('should track ticks', async () => {
      const ctr = Container.from();
      await ctr.configure();

      const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
        base: 20,
        grow: 0,
      });

      await cd.start();
      await defer(50);
      await cd.stop();
      expect(cd.getTicks()).to.equal(3);

      await defer(50);
      expect(cd.getTicks()).to.equal(3);
    });
  });
});

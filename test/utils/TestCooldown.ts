import { expect } from 'chai';
import { ConsoleLogger, Container } from 'noicejs';

import { BotModule } from '../../src/module/BotModule';
import { defer } from '../../src/utils/Async';
import { Cooldown, CooldownOptions } from '../../src/utils/Cooldown';
import { describeAsync, itAsync } from '../helpers/async';

const COOLDOWN_STEPS = [10, 10 + 2, 10 + 2 + 4, 10 + 2 + 4 + 8];

async function createCooldown(options: Partial<CooldownOptions>) {
  const ctr = Container.from(new BotModule({
    logger: ConsoleLogger.global,
  }));
  await ctr.configure();

  return ctr.create(Cooldown, options);
}

describeAsync('utils', async () => {
  describeAsync('cooldown', async () => {
    itAsync('should change the rate by the growth', async () => {
      const cd = await createCooldown({
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
      const cd = await createCooldown({
        base: 5000,
        grow: 0,
      });

      await cd.start();
      await cd.stop();
    });

    itAsync('should track ticks', async () => {
      const cd = await createCooldown({
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

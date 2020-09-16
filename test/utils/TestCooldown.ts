import { defer } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { ConsoleLogger, Container } from 'noicejs';

import { BotModule } from '../../src/module/BotModule';
import { Cooldown, CooldownOptions } from '../../src/utils/Cooldown';

/* eslint-disable no-magic-numbers */
const COOLDOWN_STEPS = [
  10,
  12, /* 10 + 2 */
  16, /* 10 + 2 + 4 */
  24, /* 10 + 2 + 4 + 8 */
];
/* eslint-enable */
const COOLDOWN_DATA = {
  base: 20,
  grow: 0,
};
const TEST_DELAY = 50;

async function createCooldown(options: Partial<CooldownOptions>) {
  const ctr = Container.from(new BotModule({
    logger: ConsoleLogger.global,
  }));
  await ctr.configure();

  return ctr.create(Cooldown, options);
}

describe('utils', async () => {
  describe('cooldown', async () => {
    it('should change the rate by the growth', async () => {
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

    it('should stop a pending timer', async () => {
      const cd = await createCooldown(COOLDOWN_DATA);

      await cd.start();
      await cd.stop();
    });

    it('should track ticks', async () => {
      const cd = await createCooldown(COOLDOWN_DATA);

      await cd.start();
      await defer(TEST_DELAY);
      await cd.stop();

      const EXPECTED_TICKS = 3;
      expect(cd.getTicks()).to.equal(EXPECTED_TICKS);

      await defer(TEST_DELAY);
      expect(cd.getTicks()).to.equal(EXPECTED_TICKS);
    });

    it('should always have a stream', async () => {
      const cd = await createCooldown({});
      expect(cd.getStream()).not.to.equal(undefined);
    });
  });
});

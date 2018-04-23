import { expect } from 'chai';
import { spy } from 'sinon';

import { Cooldown } from 'src/util/Cooldown';
import { defer } from 'src/utils';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('cooldown', async () => {
  itAsync('should change the rate by the growth', async () => {
    const cd = new Cooldown({
      base: 10,
      grow: 2
    });

    expect(cd.inc()).to.equal(12);
    expect(cd.inc()).to.equal(14);
    expect(cd.dec()).to.equal(12);
    expect(cd.getRate()).to.equal(12);
  });

  itAsync('should stop a pending timer', async () => {
    const cd = new Cooldown({
      base: 5000,
      grow: 0
    });

    cd.start();
    cd.stop();
  });

  itAsync('should track ticks', async () => {
    const cd = new Cooldown({
      base: 20,
      grow: 0
    });

    await cd.start();
    await defer(150);
    await cd.stop();

    expect(cd.getTicks()).to.equal(3);
  });
});

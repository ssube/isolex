import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Container } from 'noicejs';
import { spy } from 'sinon';

import { Cooldown, CooldownOptions } from 'src/util/Cooldown';
import { defer } from 'src/utils';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('cooldown', async () => {
  itAsync('should change the rate by the growth', async () => {
    const ctr = Container.from();
    await ctr.configure();

    const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
      config: {
        base: 10,
        grow: 2
      }
    });

    expect(cd.inc()).to.equal(12);
    expect(cd.inc()).to.equal(16);
    expect(cd.inc()).to.equal(24);
    expect(cd.dec()).to.equal(16);
    expect(cd.dec()).to.equal(12);
    expect(cd.dec()).to.equal(10);
    expect(cd.dec()).to.equal(10);
    expect(cd.getRate()).to.equal(10);
  });

  itAsync('should stop a pending timer', async () => {
    const ctr = Container.from();
    await ctr.configure();

    const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
      config: {
        base: 5000,
        grow: 0
      }
    });

    cd.start();
    cd.stop();
  });

  itAsync('should track ticks', async () => {
    const ctr = Container.from();
    await ctr.configure();

    const cd = await ctr.create<Cooldown, CooldownOptions>(Cooldown, {
      config: {
        base: 20,
        grow: 0
      }
    });

    await cd.start();
    await defer(50);
    await cd.stop();
    expect(cd.getTicks()).to.equal(3);

    await defer(50);
    expect(cd.getTicks()).to.equal(3);
  });
});

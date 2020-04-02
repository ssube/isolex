import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy, stub } from 'sinon';

import { INJECT_SCHEMA } from '../../src/BaseService';
import { Bot } from '../../src/Bot';
import { INJECT_BOT, INJECT_LOCALE } from '../../src/BotService';
import { AccountController } from '../../src/controller/AccountController';
import { Command } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Locale } from '../../src/locale';
import { Schema } from '../../src/schema';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_DATA = {
  filters: [],
  join: {
    allow: true,
    grants: [],
    roles: [],
  },
  redirect: {
    defaults: {},
    forces: {},
  },
  root: {
    allow: true,
    name: 'root',
    roles: [],
  },
  strict: false,
  token: {
    audience: [],
    duration: 4,
    issuer: '',
    secret: '',
  },
  transforms: [],
};

const TEST_METADATA = {
  kind: 'account-controller',
  name: 'test-ctrl',
};

describe('account controller', async () => {
  it('should check grants against current context', async () => {
    const sendMessage = stub().returns(Promise.resolve());
    const { container } = await createServiceContainer();
    const ctrl = await createService(container, AccountController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const checkGrants = spy();
    const tvals = [Math.random().toString(), Math.random().toString()];
    await ctrl.getGrant(ineeda<Command>({
      get: () => tvals,
    }), ineeda<Context>({
      checkGrants,
      name: 'test',
      uid: 'test',
    }));

    expect(checkGrants).to.have.callCount(tvals.length);
    expect(sendMessage).to.have.callCount(1);
  });

  it('should list grants in current context', async () => {
    const sendMessage = stub().returns(Promise.resolve());
    const { container } = await createServiceContainer();
    const ctrl = await createService(container, AccountController, {
      [INJECT_BOT]: ineeda<Bot>({
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const listGrants = spy();
    const tvals = [Math.random().toString(), Math.random().toString()];
    await ctrl.listGrants(ineeda<Command>({
      get: () => tvals,
    }), ineeda<Context>({
      listGrants,
      name: 'test',
      uid: 'test',
    }));

    expect(listGrants).to.have.callCount(tvals.length);
    expect(sendMessage).to.have.callCount(1);
  });

  it('should print help about grants', async () => {
    const sendMessage = stub().returns(Promise.resolve());
    const { container, services } = await createServiceContainer();
    services.bind(INJECT_SCHEMA).toInstance(new Schema());

    const locale = await container.create(Locale, {
      data: {
        lang: 'en',
      },
      metadata: {
        kind: 'locale',
        name: 'locale',
      },
    });
    await locale.start();
    services.bind(INJECT_LOCALE).toInstance(locale);

    const ctrl = await createService(container, AccountController, {
      [INJECT_BOT]: ineeda<Bot>({
        getLocale: () => locale,
        sendMessage,
      }),
      data: TEST_DATA,
      metadata: TEST_METADATA,
    });

    const context = ineeda<Context>({
      name: 'test',
      uid: 'test',
      user: {
        locale: {
          lang: 'test',
        },
      },
    });
    await ctrl.getGrantHelp(ineeda<Command>({
      context,
      has: () => false,
    }), context);

    expect(sendMessage).to.have.callCount(1);
  });
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { stub } from 'sinon';

import { INJECT_CLOCK } from '../../src/BaseService';
import { BotServiceOptions } from '../../src/BotService';
import { User } from '../../src/entity/auth/User';
import { Message } from '../../src/entity/Message';
import { FetchOptions, ListenerData } from '../../src/listener';
import { SessionListener } from '../../src/listener/SessionListener';
import { Clock } from '../../src/utils/Clock';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

class StubSessionListener extends SessionListener<ListenerData> {
  constructor(options: BotServiceOptions<ListenerData>) {
    super(options, 'isolex#/definitions/service-listener');
  }

  public async send(msg: Message) {
    /* noop */
  }

  public async fetch(options: FetchOptions) {
    return [];
  }
}

const TEST_LOCALE = {
  date: 'en-US',
  lang: 'en-US',
  time: 'en-US',
  timezone: 'en-US',
};

const TEST_DATA = {
  filters: [],
  strict: false,
};

const TEST_METADATA = {
  kind: 'test-listener',
  name: 'test-listener',
};

describeLeaks('session listener', async () => {
  itLeaks('should create a sesion with the current time', async () => {
    const stubDate = stub(new Date());
    const clock = ineeda<Clock>({
      getDate: () => stubDate,
    });

    const { container } = await createServiceContainer();
    const listener = await createService(container, StubSessionListener, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
      [INJECT_CLOCK]: clock,
    });

    const session = await listener.createSession('test', new User({
      locale: TEST_LOCALE,
      name: '',
      roles: [],
    }));
    expect(session.createdAt).to.equal(stubDate);
  });

  itLeaks('should store the created sessions', async () => {
    const stubDate = stub(new Date());
    const clock = ineeda<Clock>({
      getDate: () => stubDate,
    });

    const { container } = await createServiceContainer();
    const listener = await createService(container, StubSessionListener, {
      data: TEST_DATA,
      metadata: TEST_METADATA,
      [INJECT_CLOCK]: clock,
    });

    const session = await listener.createSession('test', new User({
      locale: TEST_LOCALE,
      name: '',
      roles: [],
    }));
    const fetch = await listener.getSession('test');
    expect(fetch).to.equal(session);
  });
});

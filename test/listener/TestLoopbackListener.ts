import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { Message } from '../../src/entity/Message';
import { LoopbackListener } from '../../src/listener/LoopbackListener';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

describeLeaks('loopback listener', async () => {
  itLeaks('should send messages to the bot', async () => {
    const receive = spy();
    const { container } = await createServiceContainer();
    const listener = await createService(container, LoopbackListener, {
      [INJECT_BOT]: ineeda<Bot>({
        receive,
      }),
      data: {
        filters: [],
        strict: false,
      },
      metadata: {
        kind: 'loopback-listener',
        name: 'test-listener',
      },
    });

    const msg = ineeda<Message>();
    await listener.send(msg);

    expect(receive).to.have.callCount(1).and.been.calledWith(msg);
  });
});

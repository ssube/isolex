import { expect } from 'chai';
import { MissingValueError } from 'noicejs';

import { BotService, BotServiceData, BotServiceOptions } from '../src/BotService';
import { describeLeaks, itLeaks } from './helpers/async';
import { createContainer } from './helpers/container';

class ConcreteBotService extends BotService<BotServiceData> {
  constructor(options: BotServiceOptions<BotServiceData>) {
    super(options, '');
  }
}

describeLeaks('bot service', async () => {
  itLeaks('should check for a bot', async () => {
    const { container } = await createContainer();
    expect(container.create(ConcreteBotService)).to.eventually.be.rejectedWith(MissingValueError);
  });

  itLeaks('should load filters');
  itLeaks('should check filters');
  itLeaks('should check scoped grants');
});

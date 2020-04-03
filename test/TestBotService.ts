import { expect } from 'chai';
import { MissingValueError } from 'noicejs';

import { BotService, BotServiceData, BotServiceOptions } from '../src/BotService';
import { createContainer } from './helpers/container';

class ConcreteBotService extends BotService<BotServiceData> {
  constructor(options: BotServiceOptions<BotServiceData>) {
    super(options, '');
  }
}

describe('bot service', async () => {
  it('should check for a bot', async () => {
    const { container } = await createContainer();
    return expect(container.create(ConcreteBotService)).to.eventually.be.rejectedWith(MissingValueError);
  });

  it('should load filters');
  it('should check filters');
  it('should check scoped grants');
});

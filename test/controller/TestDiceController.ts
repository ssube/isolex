import { getTestLogger } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { INJECT_LOGGER, INJECT_SCHEMA } from '../../src/BaseService';
import { Bot } from '../../src/Bot';
import { INJECT_BOT } from '../../src/BotService';
import { DiceController } from '../../src/controller/DiceController';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Locale } from '../../src/locale';
import { createService, createServiceContainer, createTestOptions } from '../helpers/container';
import { getTestContextData } from '../helpers/context';

describe('dice controller', async () => {
  it('should exist', async () => {
    const testOptions = createTestOptions();
    const { container } = await createServiceContainer();
    const locale = await container.create(Locale, {
      data: {
        lang: 'en',
      },
      metadata: {
        kind: 'locale',
        name: 'locale',
      },
      [INJECT_LOGGER]: getTestLogger(),
      [INJECT_SCHEMA]: testOptions[INJECT_SCHEMA],
    });

    const botStub = createStubInstance(Bot);
    botStub.getLocale.returns(locale);
    const bot = botStub as unknown as Bot;

    const controller = await createService(container, DiceController, {
      [INJECT_BOT]: bot,
      data: {
        filters: [],
        redirect: {
          defaults: {},
          forces: {},
        },
        strict: true,
        transforms: [],
      },
      metadata: {
        kind: 'dice-controller',
        name: 'test_dice',
      },
    });

    const ctx = new Context(getTestContextData());
    await controller.createRoll(new Command({
      context: ctx,
      data: {
        count: ['1'],
        sides: ['1'],
      },
      labels: {},
      noun: '',
      verb: CommandVerb.Get,
    }), ctx);

    /* eslint-disable-next-line @typescript-eslint/unbound-method */
    expect(bot.sendMessage).to.have.callCount(1);
  });
});

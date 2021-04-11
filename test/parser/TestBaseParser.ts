import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { BotServiceOptions, INJECT_STORAGE } from '../../src/BotService';
import { User } from '../../src/entity/auth/User';
import { Command, CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Fragment } from '../../src/entity/Fragment';
import { Message } from '../../src/entity/Message';
import { ParserData, ParserOutput } from '../../src/parser';
import { BaseParser } from '../../src/parser/BaseParser';
import { Storage } from '../../src/storage';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_PARSER = 'test-parser';

class TestParser extends BaseParser<ParserData> {
  constructor(options: BotServiceOptions<ParserData>) {
    super(options, 'isolex#/definitions/service-parser');
  }

  public async decode(msg: Message): Promise<ParserOutput> {
    return {
      data: {},
    };
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    return [];
  }
}

describe('base parser', async () => {
  it('should match messages', async () => {
    const { container } = await createServiceContainer();
    const parser = await createService(container, TestParser, {
      data: {
        defaultCommand: {
          data: {},
          labels: {},
          noun: '',
          verb: CommandVerb.Create,
        },
        filters: [],
        match: {
          rules: [],
        },
        preferData: false,
        strict: false,
      },
      metadata: {
        kind: TEST_PARSER,
        name: TEST_PARSER,
      },
    });
    expect(await parser.match(ineeda<Message>({
      body: '',
    }))).to.equal(true);
  });

  it('should complete fragments', async () => {
    const { container } = await createServiceContainer();
    const parser = await createService(container, TestParser, {
      [INJECT_STORAGE]: ineeda<Storage>({
        getRepository: () => ineeda<Repository<Context>>({
          save(ctx: Context) {
            return ctx;
          }
        }),
      }),
      data: {
        defaultCommand: {
          data: {},
          labels: {},
          noun: '',
          verb: CommandVerb.Create,
        },
        filters: [],
        match: {
          rules: [],
        },
        preferData: false,
        strict: false,
      },
      metadata: {
        kind: TEST_PARSER,
        name: TEST_PARSER,
      },
    });
    const results = await parser.complete(new Context({
      channel: {
        id: '',
        thread: '',
      },
      sourceUser: {
        name: 'test',
        uid: '0',
      },
      user: ineeda<User>(),
    }), new Fragment({
      data: {},
      key: '',
      labels: {},
      noun: '',
      parserId: '',
      userId: '',
      verb: CommandVerb.Create,
    }), []);
    expect(results.length).to.be.greaterThan(0);
  });

  it('should prefer the data command');
  it('should prefer the command');
});

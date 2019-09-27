import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from '../../src/BotService';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { MimeTypeError } from '../../src/error/MimeTypeError';
import { SplitParser } from '../../src/parser/SplitParser';
import { Storage } from '../../src/storage';
import { RuleOperator } from '../../src/utils/match';
import { TYPE_JPEG, TYPE_TEXT } from '../../src/utils/Mime';
import { describeAsync, itAsync } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_CONFIG = {
  dataMapper: {
    rest: 'foo',
    skip: 0,
    take: [],
  },
  defaultCommand: {
    data: {},
    labels: {},
    noun: 'test',
    verb: CommandVerb.Get,
  },
  every: false,
  filters: [],
  match: {
    rules: [],
  },
  preferData: false,
  split: {
    brackets: true,
    keepDoubleQuotes: true,
    keepEscaping: false,
    keepQuotes: true,
    keepSingleQuotes: true,
    quotes: ['"'],
    separator: ' ',
  },
  strict: true,
};

const TEST_STORAGE = ineeda<Storage>({
  getRepository() {
    return ineeda<Repository<Context>>({
      save() {
        return Promise.resolve(ineeda<Context>());
      },
    });
  },
});

describeAsync('split parser', async () => {
  itAsync('should split on whitespace', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, SplitParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const commands = await svc.parse(new Message({
      body: 'test message',
      context: new Context({
        channel: {
          id: 'test',
          thread: 'test',
        },
        name: 'test',
        uid: 'test',
      }),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(commands[0].get('foo')).to.deep.equal([
      'test',
      'message',
    ]);
  });

  itAsync('should split respect parens', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, SplitParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const commands = await svc.parse(new Message({
      body: 'test (message group) [second group] bits "third group"',
      context: new Context({
        channel: {
          id: 'test',
          thread: 'test',
        },
        name: 'test',
        uid: 'test',
      }),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(commands[0].get('foo')).to.deep.equal([
      'test',
      '(message group)',
      '[second group]',
      'bits',
      '"third group"',
    ]);
  });

  itAsync('should reject messages with other types', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, SplitParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const msg = new Message({
      body: '',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_JPEG,
    });
    return expect(svc.parse(msg)).to.eventually.be.rejectedWith(MimeTypeError);
  });

  itAsync('should remove prefixes', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, SplitParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: {
        ...TEST_CONFIG,
        match: {
          rules: [{
            key: 'body',
            operator: RuleOperator.Every,
            values: [{
              string: '!!test',
            }],
          }],
        },
      },
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const msg = new Message({
      body: '!!test foo bar',
      context: ineeda<Context>({
        channel: {
          id: '',
          thread: '',
        },
        name: 'foo',
        uid: 'bar',
      }),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    });

    const [command] = await svc.parse(msg);
    expect(command.get('foo')).to.deep.equal(['foo', 'bar']);
  });
});

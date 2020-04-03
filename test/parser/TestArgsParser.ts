import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from '../../src/BotService';
import { NOUN_FRAGMENT } from '../../src/controller/CompletionController';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Fragment } from '../../src/entity/Fragment';
import { Message } from '../../src/entity/Message';
import { MimeTypeError } from '../../src/error/MimeTypeError';
import { ArgsParser } from '../../src/parser/ArgsParser';
import { Storage } from '../../src/storage';
import { TYPE_JPEG, TYPE_TEXT } from '../../src/utils/Mime';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_CONFIG = {
  args: {
    required: ['foo', 'bar'],
    string: ['foo', 'bar'],
  },
  defaultCommand: {
    data: {},
    labels: {},
    noun: 'test',
    verb: CommandVerb.Get,
  },
  filters: [],
  match: {
    rules: [],
  },
  preferData: false,
  strict: true,
};

const TEST_METADATA = {
  kind: 'test',
  name: 'test',
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

describe('args parser', async () => {
  it('should parse a message body', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, ArgsParser, {
      data: TEST_CONFIG,
      metadata: TEST_METADATA,
    });

    const data = await svc.decode(new Message({
      body: '--foo=1 --bar=2',
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(data.data).to.deep.equal({
      _: [],
      bar: ['2'],
      foo: ['1'],
    });
  });

  it('should prompt to complete missing fields', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, ArgsParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: TEST_METADATA,
    });

    const commands = await svc.parse(new Message({
      body: '--foo=1',
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
    expect(commands).to.have.lengthOf(1);

    const [cmd] = commands;
    expect(cmd.noun).to.equal(NOUN_FRAGMENT);
    expect(cmd.getHead('foo')).to.equal('1');
  });

  it('should complete a fragment', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, ArgsParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: TEST_METADATA,
    });

    const commands = await svc.complete(new Context({
      channel: {
        id: 'test',
        thread: 'test',
      },
      name: 'test',
      uid: 'test',
    }), new Fragment({
      data: {
        foo: ['1'],
      },
      key: 'bar',
      labels: {},
      noun: 'test',
      parserId: 'test',
      userId: 'test',
      verb: CommandVerb.Get,
    }), ['--bar=2']); // TODO: next argument should not need prefix
    expect(commands).to.have.lengthOf(1);

    const [cmd] = commands;
    expect(cmd.noun).to.equal('test');
    expect(cmd.getHead('foo')).to.equal('1');
    expect(cmd.getHead('bar')).to.equal('2');
  });

  it('should reject messages with other types', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, ArgsParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: TEST_METADATA,
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
});

import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from '../../src/BotService';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { MimeTypeError } from '../../src/error/MimeTypeError';
import { EchoParser } from '../../src/parser/EchoParser';
import { Storage } from '../../src/storage';
import { TYPE_JPEG, TYPE_TEXT } from '../../src/utils/Mime';
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

describe('echo parser', async () => {
  it('should parse the message body as-is', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, EchoParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const [cmd] = await svc.parse(new Message({
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
    expect(cmd.getHead('foo')).to.equal('test message');
  });

  it('should reject messages with other types', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, EchoParser, {
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

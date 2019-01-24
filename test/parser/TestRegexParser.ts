import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from 'src/BotService';
import { CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { RegexParser } from 'src/parser/RegexParser';
import { Storage } from 'src/storage';
import { TYPE_JPEG, TYPE_TEXT } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

const TEST_CONFIG = {
  dataMapper: {
    rest: 'foo',
    skip: 0,
    take: ['body', 'numbers', 'letters'],
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
  regexp: '([0-9]+) ([a-z]+)',
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

describeAsync('regex parser', async () => {
  itAsync('should split the message body into groups', async () => {
    const { container } = await createContainer();
    const svc = await createService(container, RegexParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const body = '0123456789 abcdefghij';
    const [cmd] = await svc.parse(new Message({
      body,
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

    expect(cmd.getHead('body')).to.equal(body);
    expect(cmd.getHead('numbers')).to.equal('0123456789');
    expect(cmd.getHead('letters')).to.equal('abcdefghij');
  });

  itAsync('should reject messages with other types', async () => {
    const { container } = await createContainer();
    const svc = await createService(container, RegexParser, {
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
});

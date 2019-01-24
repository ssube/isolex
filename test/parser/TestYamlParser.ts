import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from 'src/BotService';
import { CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { MimeTypeError } from 'src/error/MimeTypeError';
import { YamlParser } from 'src/parser/YamlParser';
import { Storage } from 'src/storage';
import { TYPE_JPEG, TYPE_YAML } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

const TEST_CONFIG = {
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

const TEST_STORAGE = ineeda<Storage>({
  getRepository() {
    return ineeda<Repository<Context>>({
      save() {
        return Promise.resolve(ineeda<Context>());
      },
    });
  },
});

describeAsync('yaml parser', async () => {
  itAsync('should parse the message body', async () => {
    const { container } = await createContainer();
    const svc = await createService(container, YamlParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const [cmd] = await svc.parse(new Message({
      body: '{foo: ["1"], bar: ["2"]}',
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
      type: TYPE_YAML,
    }));
    expect(cmd.getHead('foo')).to.equal('1', 'foo');
    expect(cmd.getHead('bar')).to.equal('2', 'bar');
  });

  itAsync('should reject messages with other types', async () => {
    const { container } = await createContainer();
    const svc = await createService(container, YamlParser, {
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

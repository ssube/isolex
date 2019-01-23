import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { Repository } from 'typeorm';

import { CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { EchoParser } from 'src/parser/EchoParser';
import { Storage } from 'src/storage';
import { TYPE_TEXT } from 'src/utils/Mime';

import { describeAsync, itAsync } from 'test/helpers/async';
import { createContainer, createService } from 'test/helpers/container';

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

const TEST_STORAGE = ineeda<Storage>({
  getRepository() {
    return ineeda<Repository<Context>>({
      save() {
        return Promise.resolve(ineeda<Context>());
      },
    });
  },
});

describeAsync('echo parser', async () => {
  itAsync('should decode the message body as-is', async () => {
    const { container } = await createContainer();
    const svc = await createService(container, EchoParser, {
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const data = await svc.decode(new Message({
      body: 'test message',
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));
    expect(data).to.equal('test message');
  });
});

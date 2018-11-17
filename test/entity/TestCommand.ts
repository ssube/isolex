import { expect } from 'chai';

import { Command, CommandVerb } from 'src/entity/Command';
import { Context } from 'src/entity/Context';

import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('command', async () => {
  itAsync('should copy data', async () => {
    const data = {
      test: ['1'],
    };
    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: '',
      }),
      data,
      noun: '',
      verb: CommandVerb.None,
    });

    expect(cmd.data).not.to.equal(data);
    expect(cmd.data.size).to.equal(1);
    expect(cmd.data.get('test')).to.deep.equal(data.test);

    expect(cmd.get('test')).to.deep.equal(['1']);
  });

  itAsync('should get args by name', async () => {
    const data = {
      test: ['1'],
    };
    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: '',
      }),
      data,
      noun: '',
      verb: CommandVerb.None,
    });

    expect(cmd.get('test')).to.deep.equal(['1']);
  });
});

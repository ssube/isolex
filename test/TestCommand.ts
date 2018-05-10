import { expect } from 'chai';
import { spy } from 'sinon';

import { Command, CommandType } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('command', async () => {
  itAsync('should copy data', async () => {
    const data = {
      test: 1
    };
    const cmd = Command.create({
      context: Context.create({
        listenerId: '',
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      }),
      data,
      name: '',
      type: CommandType.None
    });

    expect(cmd.get('test')).to.equal(1);
    expect(cmd.data).not.to.equal(data);
  });
});

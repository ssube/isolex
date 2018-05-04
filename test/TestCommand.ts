import { expect } from 'chai';
import { spy } from 'sinon';

import { Command, CommandType } from 'src/Command';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('command', async () => {
  itAsync('should copy data', async () => {
    const data = {
      test: 1
    };
    const cmd = new Command({
      context: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      },
      data,
      name: '',
      type: CommandType.None
    });

    expect(cmd.get('test')).to.equal(1);
    expect(cmd.data).not.to.equal(data);
  });

  itAsync('convert objects to maps', async () => {
    const map = Command.toPropMap({
      foo: '1',
      bar: '2'
    });

    expect(Array.from(map.entries())).to.deep.equal([['foo', '1'], ['bar', '2']]);
  });
});

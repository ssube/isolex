import { expect } from 'chai';
import { spy } from 'sinon';

import { Command, CommandType } from 'src/command/Command';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('command', async () => {
  itAsync('should copy data', async () => {
    const cmd = new Command({
      data: {'test': 1},
      from: {
        roomId: '',
        userId: '',
        userName: ''
      },
      name: '',
      type: CommandType.None
    });

    expect(cmd.get('test')).to.equal(1);
  });
});

import { expect } from 'chai';
import mockFS from 'mock-fs';

import { removePid, writePid } from '../../src/utils/PidFile';

const PID_PATH = 'foo';
const PID_NAME = 'foo/test.pid';

describe('pid file utils', async () => {
  beforeEach(() => {
    mockFS({
      [PID_PATH]: mockFS.directory(),
    });
  });

  afterEach(() => {
    mockFS.restore();
  });

  it('should create a marker', async () => {
    await writePid(PID_NAME);

    mockFS.restore();
  });

  it('should not replace an existing marker', async () => {
    await writePid(PID_NAME);
    return expect(writePid(PID_PATH)).to.eventually.be.rejectedWith(Error);
  });

  it('should remove an existing marker', async () => {
    await writePid(PID_NAME);
    await removePid(PID_NAME);

    mockFS.restore();
  });

  it('should fail to remove a missing marker', async () =>
    expect(removePid(PID_PATH)).to.eventually.be.rejectedWith(Error)
  );
});

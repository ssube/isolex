import { ChildProcessWithoutNullStreams } from 'child_process';
import { ineeda } from 'ineeda';
import { match, stub } from 'sinon';
import { Readable, Writable } from 'stream';

import { doesExist } from '../../src/utils';

export function createSilentReadable(): Readable {
  return ineeda<Readable>({
    on: stub(),
  });
}

export function createBufferReadable(data: Buffer): Readable {
  return ineeda<Readable>({
    on: stub().withArgs('data', match.func).yields(data),
  });
}

export function createReadable(data?: Buffer): Readable {
  if (doesExist(data)) {
    return createBufferReadable(data);
  } else {
    return createSilentReadable();
  }
}

export function createChild(status: number, errbuf?: Buffer, outbuf?: Buffer) {
  const end = stub().yields();
  const write = stub().yields();
  const stdin = ineeda<Writable>({
    end,
    write,
  });

  const stderr = createReadable(errbuf);
  const stdout = createReadable(outbuf);

  const child = ineeda<ChildProcessWithoutNullStreams>({
    on: stub().withArgs('close', match.func).yields(status),
    stderr,
    stdin,
    stdout,
  });

  return {
    child,
    end,
    stderr,
    stdin,
    stdout,
    write,
  };
}

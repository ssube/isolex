import { open, unlink, write } from 'fs';
import { pid } from 'process';

import { doesExist } from '.';

type OptionalErrno = NodeJS.ErrnoException | null;

export async function writePid(path: string): Promise<void> {
  return new Promise((res, rej) => {
    open(path, 'wx', (openErr: OptionalErrno, fd: number) => {
      if (doesExist(openErr)) {
        rej(openErr);
      } else {
        write(fd, pid.toString(), 0, 'utf8', (writeErr: OptionalErrno) => {
          if (doesExist(writeErr)) {
            rej(writeErr);
          } else {
            res();
          }
        });
      }
    });
  });
}

export async function removePid(path: string): Promise<void> {
  return new Promise((res, rej) => {
    unlink(path, (err: OptionalErrno) => {
      if (doesExist(err)) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

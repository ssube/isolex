import { open, unlink, write } from 'fs';
import { pid } from 'process';

import { doesExist } from '.';

export async function writePid(path: string): Promise<void> {
  return new Promise((res, rej) => {
    open(path, 'wx', (openErr: Error, fd: number) => {
      if (doesExist(openErr)) {
        rej(openErr);
      } else {
        write(fd, pid.toString(), 0, 'utf8', (writeErr: Error) => {
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
    unlink(path, (err: Error) => {
      if (doesExist(err)) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

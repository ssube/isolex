import { open, unlink, write } from 'fs';
import { pid } from 'process';

export async function writePid(path: string): Promise<void> {
  return new Promise((res, rej) => {
    open(path, 'wx', (openErr: Error, fd: number) => {
      if (openErr) {
        rej(openErr);
      } else {
        write(fd, pid.toString(), 0, 'utf8', (writeErr: Error) => {
          if (writeErr) {
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
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

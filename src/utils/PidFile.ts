import { doesExist, Optional } from '@apextoaster/js-utils';
import { open, unlink, write } from 'fs';
import { pid } from 'process';

type OptionalErrno = Optional<NodeJS.ErrnoException>;

/**
 * Write the current process ID to a file at the given `path`.
 *
 * @public
 */
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

/**
 * Remove the file at the given `path`.
 */
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

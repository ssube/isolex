import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { BaseError } from 'noicejs';
import { Writable } from 'stream';

import { doesExist, Optional } from '.';
import { ChildProcessError } from '../error/ChildProcessError';
import { encode } from './Buffer';
import { NameValuePair } from './Map';

export interface ChildOptions {
  command: string;
  cwd: string;
  env: Array<NameValuePair<string>>;
  timeout: number;
}

export interface ChildResult {
  status: number;
  stderr: string;
  stdout: string;
}

export type ChildSpawner = typeof spawn;

export function waitForChild(child: ChildProcessWithoutNullStreams): Promise<ChildResult> {
  return new Promise((res, rej) => {
    const stderr: Array<Buffer> = [];
    const stdout: Array<Buffer> = [];

    child.stderr.on('data', (chunk) => {
      stderr.push(chunk);
    });

    child.stdout.on('data', (chunk) => {
      stdout.push(chunk);
    });

    child.on('close', (status: number) => {
      const errors = encode(stderr, 'utf-8');
      if (status > 0) {
        rej(new ChildProcessError(
          `child process exited with error status: ${status}`,
          new BaseError(errors)
        ));
        return;
      }

      if (errors.length > 0) {
        rej(new ChildProcessError(
          'child process exited with error output',
          new BaseError(errors)
        ));
        return;
      }

      res({
        status,
        stderr: errors,
        stdout: encode(stdout, 'utf-8'),
      });
    });
  });
}

export function writeValue(stream: Writable, value: string): Promise<boolean> {
  return new Promise<boolean>((res, rej) => {
    stream.write(value, (err: Optional<Error>) => {
      if (doesExist(err)) {
        rej(err);
      } else {
        stream.end(() => {
          res(true);
        });
      }
    });
  });
}

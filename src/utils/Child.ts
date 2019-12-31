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

const CHILD_ENCODING = 'utf-8';
const CHILD_EVENT = 'child process emitted error event';
const CHILD_STATUS = 'child process exited with error status';
const CHILD_OUTPUT = 'child process emitted error output';

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

    child.on('error', (err: Error | number) => {
      if (err instanceof Error) {
        rej(new ChildProcessError(CHILD_EVENT, err));
      }
    });

    child.on('close', (status: number) => {
      const errors = encode(stderr, CHILD_ENCODING);
      if (status > 0) {
        const msg = `${CHILD_STATUS}: ${status}`;
        rej(new ChildProcessError(msg, new BaseError(errors)));
        return;
      }

      if (errors.length > 0) {
        rej(new ChildProcessError(CHILD_OUTPUT, new BaseError(errors)));
        return;
      }

      res({
        status,
        stderr: errors,
        stdout: encode(stdout, CHILD_ENCODING),
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

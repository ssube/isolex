import { BaseError } from 'noicejs';

export class ChildProcessError extends BaseError {
  constructor(msg = 'child process exited with error status', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

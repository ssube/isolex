import { BaseError } from 'noicejs';

export class TimeoutError extends BaseError {
  constructor(msg = 'operation timed out', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

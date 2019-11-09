import { BaseError } from 'noicejs';

export class MissingKeyError extends BaseError {
  constructor(msg = 'missing key', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

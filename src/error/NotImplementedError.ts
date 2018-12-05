import { BaseError } from 'noicejs';

export class NotImplementedError extends BaseError {
  constructor(msg = 'method not implemented', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

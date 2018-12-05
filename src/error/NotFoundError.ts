import { BaseError } from 'noicejs';

export class NotFoundError extends BaseError {
  constructor(msg = 'value not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

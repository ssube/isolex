import { BaseError } from 'noicejs';

export class SessionRequiredError extends BaseError {
  constructor(msg = 'session required', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

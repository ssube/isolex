import { BaseError } from 'noicejs';

export class MimeTypeError extends BaseError {
  constructor(msg = 'incorrect mime type', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

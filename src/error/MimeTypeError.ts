import {BaseError} from 'src/error/BaseError';

export class MimeTypeError extends BaseError {
  constructor(msg = 'incorrect mime type', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

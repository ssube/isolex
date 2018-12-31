import { BaseError } from 'noicejs';

export class NotInitializedError extends BaseError {
  constructor(msg = 'property not initialized', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

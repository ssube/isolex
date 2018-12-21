import { BaseError } from 'noicejs';

export class SchemaError extends BaseError {
  constructor(msg = 'schema validation error', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

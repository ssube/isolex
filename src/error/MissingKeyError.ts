import { BaseError } from "noicejs";

export class MissingKeyError extends BaseError {
  constructor(msg: string = 'missing key', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}

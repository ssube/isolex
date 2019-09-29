import { expect } from 'chai';

import { InvalidArgumentError } from '../../src/error/InvalidArgumentError';
import { MimeTypeError } from '../../src/error/MimeTypeError';
import { MissingKeyError } from '../../src/error/MissingKeyError';
import { NotFoundError } from '../../src/error/NotFoundError';
import { NotImplementedError } from '../../src/error/NotImplementedError';
import { SchemaError } from '../../src/error/SchemaError';
import { SessionRequiredError } from '../../src/error/SessionRequiredError';
import { TimeoutError } from '../../src/error/TimeoutError';

const errors = [
  InvalidArgumentError,
  MimeTypeError,
  MissingKeyError,
  NotFoundError,
  NotImplementedError,
  SchemaError,
  SessionRequiredError,
  TimeoutError,
];

describe('errors', () => {
  for (const errorType of errors) {
    describe(errorType.name, () => {
      it('should have a message', () => {
        const err = new errorType();
        expect(err.message).to.not.equal('');
      });

      it('should include nested errors in the stack trace', () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.stack).to.include('inner', 'inner error message').and.include('outer', 'outer error message');
      });

      it('should have the nested error', () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.cause()).to.equal(inner);
        expect(err.length).to.equal(1);
      });
    });
  }
});

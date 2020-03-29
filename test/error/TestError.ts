import { expect } from 'chai';

import { MimeTypeError } from '../../src/error/MimeTypeError';
import { NotInitializedError } from '../../src/error/NotInitializedError';
import { SchemaError } from '../../src/error/SchemaError';
import { SessionRequiredError } from '../../src/error/SessionRequiredError';

const errors = [
  MimeTypeError,
  NotInitializedError,
  SchemaError,
  SessionRequiredError,
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

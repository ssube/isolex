import { expect } from 'chai';

import { Schema } from '../../src/schema';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('json schema', async () => {
  itLeaks('should validate objects', async () => {
    const schema = new Schema();
    const data = {
      data: {
        filters: [],
        strict: true,
      },
      metadata: {
        kind: 'bot',
        name: 'bot',
      },
    };

    const results = schema.match(data, 'isolex#/definitions/service-definition');
    expect(results.valid).to.equal(true, 'schema must validate object');
  });

  itLeaks('should set defaults', async () => {
    const schema = new Schema();
    const data = {
      data: {
        filters: [],
      },
      metadata: {
        kind: 'bot',
        name: 'bot',
      },
    };

    const results = schema.match(data, 'isolex#/definitions/service-definition');
    expect(results.valid).to.equal(true, 'schema must validate object');
    expect(data.data).to.have.ownProperty('strict').which.equals(true, 'schema should default to strict');
  });

  itLeaks('should return errors', async () => {
    const schema = new Schema();
    expect(schema.getErrors()).to.be.have.lengthOf(0, 'errors must start empty');

    const result = schema.match({
      wrong: 'shape',
    });

    expect(result.valid).to.equal(false, 'object must fail to validate');
    expect(schema.getErrors()).to.have.length.greaterThan(0, 'errors must be present after failure');
  });
});

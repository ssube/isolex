import Ajv, { ErrorObject, SchemaObject } from 'ajv';

import { SCHEMA_KEYWORD_REGEXP } from './keyword/Regexp';
import SCHEMA_GLOBAL from './schema.yml';

export interface SchemaResult {
  errors: Array<string>;
  valid: boolean;
}

export class Schema {
  public static formatError(err: ErrorObject): string {
    switch (err.keyword) {
      case 'additionalProperties':
        return `${err.message}: ${err.params.additionalProperty} at ${err.instancePath} not expected in ${err.schemaPath}`;
      default:
        return `${err.message} at ${err.schemaPath} (${err.instancePath})`;
    }
  }

  protected validator: Ajv;

  constructor(schema: SchemaObject = (SCHEMA_GLOBAL as SchemaObject)) {
    this.validator = new Ajv({
      allErrors: true,
      coerceTypes: 'array',
      keywords: [
        SCHEMA_KEYWORD_REGEXP,
      ],
      removeAdditional: 'failing',
      useDefaults: true,
      verbose: true,
    }).addSchema(schema, 'isolex');
  }

  public match(value: unknown, ref = 'isolex#'): SchemaResult {
    const valid = this.validator.validate({ $ref: ref }, value);
    if (valid === true) {
      return {
        errors: [],
        valid,
      };
    } else {
      return {
        errors: this.getErrors(),
        valid: false,
      };
    }
  }

  public getErrors(): Array<string> {
    if (Array.isArray(this.validator.errors)) {
      return this.validator.errors.map((it) => Schema.formatError(it));
    } else {
      return [];
    }
  }
}

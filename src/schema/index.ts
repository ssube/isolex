import Ajv from 'ajv';

import { InvalidArgumentError } from '../error/InvalidArgumentError';
import { SCHEMA_KEYWORD_REGEXP } from './keyword/Regexp';
import * as SCHEMA_GLOBAL from './schema.yml';

export interface SchemaResult {
  errors: Array<string>;
  valid: boolean;
}

export class Schema {
  public static formatError(err: Ajv.ErrorObject): string {
    switch (err.keyword) {
      case 'additionalProperties':
        const params = err.params as Ajv.AdditionalPropertiesParams;
        return `${err.message}: ${params.additionalProperty} at ${err.dataPath} not expected in ${err.schemaPath}`;
      default:
        return `${err.message} at ${err.schemaPath} (${err.dataPath})`;
    }
  }

  protected compiler: Ajv.Ajv;

  private readonly children: Map<string, object>;

  constructor(schema: object = SCHEMA_GLOBAL) {
    this.children = new Map();
    this.compiler = new Ajv({
      allErrors: true,
      coerceTypes: 'array',
      missingRefs: 'fail',
      removeAdditional: 'failing',
      schemaId: 'auto',
      useDefaults: true,
      verbose: true,
    });
    this.compiler.addKeyword('regexp', SCHEMA_KEYWORD_REGEXP);

    this.addSchema('isolex', schema);
  }

  public addSchema(name: string, schema: object) {
    if (!this.children.has(name)) {
      this.children.set(name, schema);
      this.compiler.addSchema(schema, name);
    } else {
      throw new InvalidArgumentError('schema name already exists');
    }
  }

  public match(value: unknown, ref = 'isolex#'): SchemaResult {
    const valid = this.compiler.validate({ $ref: ref }, value);
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
    if (Array.isArray(this.compiler.errors)) {
      return this.compiler.errors.map((it) => Schema.formatError(it));
    } else {
      return [];
    }
  }
}

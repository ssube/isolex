import * as Ajv from 'ajv';
import { filterNil } from '.';

/* tslint:disable-next-line:no-var-requires */
export const SCHEMA_GLOBAL = require('src/schema.yml');

export interface SchemaResult {
  errors: Array<string>;
  valid: boolean;
}

export class Schema {
  protected compiler: Ajv.Ajv;

  constructor(schema: any = SCHEMA_GLOBAL) {
    this.compiler = new Ajv({
      allErrors: true,
      schemaId: 'auto',
    });
    this.compiler.addSchema(schema, 'isolex');
  }

  public match(value: any, ref: string = 'isolex#'): SchemaResult {
    const valid = this.compiler.validate({ $ref: ref }, value);
    if (valid === true) {
      return {
        errors: [],
        valid,
      };
    } else {
      const errors = this.compiler.errors || [];
      return {
        errors: filterNil(errors.map((it) => this.formatError(it))),
        valid: false,
      };
    }
  }

  public formatError(err: Ajv.ErrorObject): string {
    console.warn(err);
    switch (err.keyword) {
      case 'additionalProperties':
        const params = err.params as Ajv.AdditionalPropertiesParams;
        return `${err.message}: ${params.additionalProperty} at ${err.dataPath} not expected in ${err.schemaPath}`;
      default:
        return `${err.message} at ${err.schemaPath}`;
    }
  }
}

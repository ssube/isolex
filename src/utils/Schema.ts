import Ajv from 'ajv';
import { filterNil } from '.';

export interface SchemaResult {
  errors: Array<string>;
  valid: boolean;
}

export class Schema {
  protected compiled: Ajv.ValidateFunction;
  protected compiler: Ajv.Ajv;

  constructor(schema: any) {
    this.compiler = new Ajv({
      schemaId: 'auto',
    });
    this.compiled = this.compiler.compile(schema);
  }

  public match(value: any): SchemaResult {
    const valid = this.compiled(value);
    if (valid === true) {
      return {
        errors: [],
        valid,
      };
    } else {
      const errors = this.compiled.errors || [];
      return {
        errors: filterNil(errors.map((it) => it.message)),
        valid: false,
      };
    }
  }
}

import { FuncKeywordDefinition } from 'ajv';

export interface SchemaOptions {
  flags: string;
}

export const SCHEMA_KEYWORD_REGEXP: FuncKeywordDefinition = {
  compile(schema: boolean | SchemaOptions) {
    if (typeof schema === 'boolean') {
      return (data: unknown) => (data instanceof RegExp) === schema;
    } else {
      return (data: RegExp) => data.flags === schema.flags;
    }
  },
  keyword: 'regexp',
  metaSchema: {
    oneOf: [{
      type: 'boolean',
    }, {
      properties: {
        flags: {
          type: 'string',
        },
      },
      type: 'object',
    }],
  },
};

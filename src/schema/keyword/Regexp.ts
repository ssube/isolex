import Ajv from 'ajv';

export interface SchemaOptions {
  flags: string;
}

export const SCHEMA_KEYWORD_REGEXP: Ajv.KeywordDefinition = {
  compile(schema: boolean | SchemaOptions) {
    if (typeof schema === 'boolean') {
      return (data: unknown) => (data instanceof RegExp) === schema;
    } else {
      return (data: RegExp) => data.flags === schema.flags;
    }
  },
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

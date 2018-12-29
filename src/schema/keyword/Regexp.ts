import * as Ajv from 'ajv';
import { isBoolean } from 'lodash';

export const SCHEMA_KEYWORD_REGEXP: Ajv.KeywordDefinition = {
  compile(schema: boolean | { flags: string; }) {
    if (isBoolean(schema)) {
      return (data: any) => data instanceof RegExp;
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

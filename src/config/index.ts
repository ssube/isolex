import { Config } from '@apextoaster/js-config';
import { doesExist } from '@apextoaster/js-utils';
import { createSchema, IncludeOptions } from '@apextoaster/js-yaml-schema';
import Ajv, { Options as AjvOptions, SchemaObject } from 'ajv';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SCHEMA } from 'js-yaml';
import { join } from 'path';

import { BotDefinition } from '../Bot';
import SCHEMA_GLOBAL from '../schema/schema.yml';

export const CONFIG_ENV_HOME = 'ISOLEX_HOME';

export const INCLUDE_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SCHEMA,
};

export const SCHEMA_OPTIONS: AjvOptions = {
  allErrors: true,
  coerceTypes: 'array',
  removeAdditional: 'failing',
  useDefaults: true,
  verbose: true,
};

export function initConfig(extras: Array<string>, name: string) {
  const include = { ...INCLUDE_OPTIONS };
  const schema = createSchema({
    include,
  });
  include.schema = schema;

  const ajv = new Ajv(SCHEMA_OPTIONS);
  // validator.addKeyword('regexp', SCHEMA_KEYWORD_REGEXP);

  const validator = ajv.addSchema(SCHEMA_GLOBAL as SchemaObject, 'isolex');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  validator.validate = (() => true) as any;

  const paths = [...extras];
  const altHome = process.env[CONFIG_ENV_HOME];
  if (doesExist(altHome)) {
    paths.push(altHome);
  }

  const config = new Config<BotDefinition>({
    include,
    key: '',
    sources: [{
      name,
      paths,
      type: 'file',
    }],
    validator,
  });

  return config.getData();
}

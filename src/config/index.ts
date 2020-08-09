import { Config } from '@apextoaster/js-config';
import { doesExist } from '@apextoaster/js-utils';
import { createSchema, IncludeOptions } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';
import { join } from 'path';

import { BotDefinition } from '../Bot';
import { SCHEMA_KEYWORD_REGEXP } from '../schema/keyword/Regexp';
import * as SCHEMA_GLOBAL from '../schema/schema.yml';

export const CONFIG_ENV_HOME = 'ISOLEX_HOME';

export const INCLUDE_OPTIONS: IncludeOptions = {
  exists: existsSync,
  join,
  read: readFileSync,
  resolve: realpathSync,
  schema: DEFAULT_SAFE_SCHEMA,
};

export const SCHEMA_OPTIONS: Ajv.Options = {
  allErrors: true,
  coerceTypes: 'array',
  missingRefs: 'fail',
  removeAdditional: 'failing',
  schemaId: 'auto',
  useDefaults: true,
  verbose: true,
};

export function initConfig(extras: Array<string>, filename: string) {
  const include = {
    ...INCLUDE_OPTIONS,
  };

  createSchema({
    include,
  });

  const schema = new Ajv({
    ...SCHEMA_OPTIONS,
  });

  schema.addKeyword('regexp', SCHEMA_KEYWORD_REGEXP);
  schema.addSchema({
    $id: 'isolex',
    schema: SCHEMA_GLOBAL,
  });

  const paths = [...extras];
  const altHome = process.env[CONFIG_ENV_HOME];
  if (doesExist(altHome)) {
    paths.push(altHome);
  }

  const config = new Config<BotDefinition>({
    key: '',
    schema,
    sources: [{
      include,
      key: '',
      name: filename,
      paths,
      type: 'file',
    }],
  });

  return config.getData();
}

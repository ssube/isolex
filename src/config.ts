import { Config } from '@apextoaster/js-config';
import Ajv from 'ajv';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';
import { join } from 'path';
import yargs from 'yargs-parser';

import { BotDefinition } from './Bot';
import { SCHEMA_KEYWORD_REGEXP } from './schema/keyword/Regexp';
import * as SCHEMA_GLOBAL from './schema/schema.yml';

export const CONFIG_ENV = 'ISOLEX_HOME';

// main arguments
export const CONFIG_ARGS_NAME = 'config-name';
export const CONFIG_ARGS_PATH = 'config-path';
export const MAIN_ARGS: yargs.Options = {
  array: [CONFIG_ARGS_PATH],
  boolean: ['test'],
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: '.isolex.yml',
    [CONFIG_ARGS_PATH]: [],
  },
  envPrefix: 'isolex',
};

export function initConfig(root: string, filename: string) {
  const include = {
    exists: existsSync,
    join,
    read: readFileSync,
    resolve: realpathSync,
    schema: DEFAULT_SAFE_SCHEMA,
  };

  const schema = new Ajv({
    allErrors: true,
    coerceTypes: 'array',
    missingRefs: 'fail',
    removeAdditional: 'failing',
    schemaId: 'auto',
    useDefaults: true,
    verbose: true,
  });

  schema.addKeyword('regexp', SCHEMA_KEYWORD_REGEXP);
  schema.addSchema({
    $id: 'isolex',
    schema: SCHEMA_GLOBAL,
  });

  const config = new Config<BotDefinition>({
    key: '',
    schema,
    sources: [{
      include,
      key: '',
      name: filename,
      paths: [root],
      type: 'file',
    }],
  });

  return config.getData();
}

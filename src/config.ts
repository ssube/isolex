import { CONFIG_SCHEMA, includeOptions } from '@apextoaster/js-yaml-schema';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs-parser';

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

export function initConfig() {
  includeOptions.exists = existsSync;
  includeOptions.join = join;
  includeOptions.read = readFileSync;
  includeOptions.resolve = realpathSync;
  includeOptions.schema = CONFIG_SCHEMA;
}

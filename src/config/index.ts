import { doesExist, NotFoundError } from '@apextoaster/js-utils';
import { CONFIG_SCHEMA, includeSchema } from '@apextoaster/js-yaml-schema';
import { readFile, existsSync, readFileSync, realpathSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { isString } from 'lodash';
import { join } from 'path';
import { promisify } from 'util';

import { BotDefinition } from '../Bot';

export const CONFIG_ENV = 'ISOLEX_HOME';

const readFileAsync = promisify(readFile);

includeSchema.exists = existsSync;
includeSchema.read = readFileSync;
includeSchema.resolve = realpathSync;
includeSchema.schema = CONFIG_SCHEMA;

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `ISOLEX_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (isString(env)) {
    paths.push(join(env, name));
  }

  const home = process.env.HOME;
  if (isString(home)) {
    paths.push(join(home, name));
  }

  if (isString(__dirname)) {
    paths.push(join(__dirname, name));
  }

  for (const e of extras) {
    paths.push(join(e, name));
  }

  return paths;
}

export async function loadConfig(name: string, ...extras: Array<string>): Promise<BotDefinition> {
  const paths = completePaths(name, extras);

  for (const p of paths) {
    const data = await readConfig(p);
    if (doesExist(data)) {
      return safeLoad(data, {
        schema: CONFIG_SCHEMA,
      });
    }
  }

  throw new NotFoundError('unable to load config');
}

export async function readConfig(path: string): Promise<string | undefined> {
  try {
    // need to await this read to catch the error, need to catch the error to check the code
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = await readFileAsync(path, {
      encoding: 'utf-8',
    });
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}

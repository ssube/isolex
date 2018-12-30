import { readFile } from 'fs';
import { DEFAULT_SAFE_SCHEMA, safeLoad, Schema } from 'js-yaml';
import { flatten } from 'lodash';
import { join } from 'path';
import { promisify } from 'util';

import { BotDefinition } from 'src/Bot';
import { envType } from 'src/config/type/Env';
import { includeType } from 'src/config/type/Include';
import { regexpType } from 'src/config/type/Regexp';
import { NotFoundError } from 'src/error/NotFoundError';

export const CONFIG_ENV = 'ISOLEX_HOME';
export const CONFIG_NAME = ['isolex.yml', '.isolex.yml'];
export const CONFIG_SCHEMA = Schema.create([DEFAULT_SAFE_SCHEMA], [
  envType,
  includeType,
  regexpType,
]);

const readFileSync = promisify(readFile);

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `ISOLEX_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (env) {
    paths.push(join(env, name));
  }

  if (process.env.HOME) {
    paths.push(join(process.env.HOME, name));
  }

  if (__dirname) {
    paths.push(join(__dirname, name));
  }

  for (const e of extras) {
    paths.push(join(e, name));
  }

  return paths;
}

export async function loadConfig(...extras: Array<string>): Promise<BotDefinition> {
  const paths = flatten(CONFIG_NAME.map((it) => completePaths(it, extras)));

  for (const p of paths) {
    const data = await readConfig(p);
    if (data) {
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
    /* tslint:ignore-next-line:prefer-immediate-return */
    const data = await readFileSync(path, {
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

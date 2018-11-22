import { readFile } from 'fs';
import { DEFAULT_SAFE_SCHEMA, safeLoad, Schema } from 'js-yaml';
import { join } from 'path';
import { promisify } from 'util';

import { BotDefinition } from 'src/Bot';
import { envType } from 'src/config/EnvYamlType';
import { includeType } from 'src/config/IncludeYamlType';

export const CONFIG_ENV = 'ISOLEX__HOME';
export const CONFIG_NAME = '.isolex.yml';
export const CONFIG_SCHEMA = Schema.create([DEFAULT_SAFE_SCHEMA], [
  envType,
  includeType,
]);

const readFileSync = promisify(readFile);

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 * 
 * This will include the value of `ISOLEX__HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, ...extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (env) {
    paths.push(env);
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
  const paths = completePaths(CONFIG_NAME, ...extras);

  for (const p of paths) {
    const data = await readConfig(p);

    if (data) {
      return data;
    }
  }

  throw new Error('unable to load config');
}

export async function readConfig(path: string): Promise<BotDefinition | undefined> {
  try {
    const data = await readFileSync(path, {
      encoding: 'utf-8',
    });

    return safeLoad(data, {
      schema: CONFIG_SCHEMA,
    });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }

    return;
  }
}

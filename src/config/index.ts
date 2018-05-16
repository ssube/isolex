import { readFile } from 'fs';
import { DEFAULT_SAFE_SCHEMA, safeLoad, Schema } from 'js-yaml';
import { join } from 'path';
import { BotConfig } from 'src/Bot';
import { EnvYamlType } from 'src/config/EnvYamlType';
import { IncludeYamlType } from 'src/config/IncludeYamlType';
import { promisify } from 'util';

export const CONFIG_ENV = 'ISOLEX_HOME';
export const CONFIG_NAME = '.isolex.yml';
export const CONFIG_SCHEMA = Schema.create([
  DEFAULT_SAFE_SCHEMA
], [
  EnvYamlType,
  IncludeYamlType
]);

const readFileSync = promisify(readFile);

// search env, pwd, home
export function resolvePath(name: string, ...extras: Array<string>): Array<string> {
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

export async function loadConfig(...extras: Array<string>): Promise<BotConfig> {
  const paths = resolvePath(CONFIG_NAME, ...extras);

  for (const p of paths) {
    try {
      const data = await readFileSync(p, {
        encoding: 'utf-8'
      });

      return safeLoad(data, {
        schema: CONFIG_SCHEMA
      }) as any;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  throw new Error('unable to load config');
}

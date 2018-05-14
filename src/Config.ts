import { readFile } from 'fs';
import { safeLoad } from 'js-yaml';
import { join } from 'path';
import { BotConfig } from 'src/Bot';
import { promisify } from 'util';

const CONFIG_ENV = 'ISOLEX_HOME';
const CONFIG_NAME = '.isolex.yml';

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

      return safeLoad(data) as any;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  throw new Error('unable to load config');
}

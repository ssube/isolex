import { readFile } from 'fs';
import { safeLoad } from 'js-yaml';
import { dirname, join } from 'path';
import { BotConfig } from 'src/Bot';
import { promisify } from 'util';

const CONFIG_ENV = 'ISOLEX_CONFIG';
const CONFIG_NAME = '.isolex.yml';

const readFileSync = promisify(readFile);

// search env, pwd, home
export function resolvePath(name: string, ...extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (env) {
    paths.push(env);
  }

  if (require && require.main && require.main.filename) {
    paths.push(join(dirname(require.main.filename), name));
  }

  if (process.env.HOME) {
    paths.push(join(process.env.HOME, name));
  }

  for (const e of extras) {
    paths.push(join(e, name));
  }

  return paths;
}

export async function loadConfig(): Promise<BotConfig> {
  const paths = resolvePath(CONFIG_NAME);
  console.info('loading config from paths', paths);

  for (const p of paths) {
    try {
      const data = await readFileSync(p, {
        encoding: 'utf-8'
      });

      const config = safeLoad(data) as any;
      return config.bot;
    } catch (err) {
      console.warn('error trying to load config', p, err);
    }
  }

  throw new Error('unable to load config');
}

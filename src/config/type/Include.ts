import { existsSync, readFileSync, realpathSync } from 'fs';
import { safeLoad, Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { CONFIG_SCHEMA } from 'src/config';

export const includeType = new YamlType('!include', {
  kind: 'scalar',
  resolve(path: string) {
    const canonical = resolvePath(path);
    if (existsSync(canonical)) {
      return true;
    } else {
      throw new BaseError('included file does not exist');
    }
  },
  construct(path: string): any {
    try {
      return safeLoad(readFileSync(resolvePath(path), {
        encoding: 'utf-8',
      }), {
        schema: CONFIG_SCHEMA,
      });
    } catch (err) {
      throw new BaseError('error including file', err);
    }
  },
});

export function resolvePath(path: string): string {
  if (path[0] === '.') {
    return realpathSync(join(__dirname, path));
  } else {
    return realpathSync(path);
  }
}

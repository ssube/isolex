import { existsSync, readFileSync } from 'fs';
import { safeLoad, Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';

import { CONFIG_SCHEMA } from 'src/config';

export const includeType = new YamlType('!include', {
  kind: 'scalar',
  resolve(path: string) {
    return existsSync(path);
  },
  construct(path: string): any {
    try {
      return safeLoad(readFileSync(path, {
        encoding: 'utf-8',
      }), {
        schema: CONFIG_SCHEMA,
      });
    } catch (err) {
      throw new BaseError('error including file', err);
    }
  },
});

import { existsSync, readFileSync } from 'fs';
import { safeLoad, Type as YamlType } from 'js-yaml';
import { CONFIG_SCHEMA } from 'src/config';

export const includeType = new YamlType('!include', {
  kind: 'scalar',
  resolve(path: string) {
    return existsSync(path);
  },
  construct(path: string): any {
    return safeLoad(readFileSync(path, {
      encoding: 'utf-8'
    }), {
      schema: CONFIG_SCHEMA
    });
  }
});

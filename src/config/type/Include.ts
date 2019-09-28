import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA, safeLoad, Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { NotFoundError } from '../../error/NotFoundError';

// work around the circular dependency by setting the schema later
export const includeSchema = {
  schema: DEFAULT_SAFE_SCHEMA,
};

export const includeType = new YamlType('!include', {
  kind: 'scalar',
  resolve(path: string) {
    try {
      const canonical = resolvePath(path);
      return existsSync(canonical);
    } catch (err) {
      throw new NotFoundError(`included file does not exist: ${path}`, err);
    }
  },
  construct(path: string): unknown {
    try {
      const canonical = resolvePath(path);
      const data = readFileSync(canonical, {
        encoding: 'utf-8',
      });
      return safeLoad(data, {
        schema: includeSchema.schema,
      });
    } catch (err) {
      throw new BaseError(`error including file: ${path}`, err);
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

import { Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';

export const envType = new YamlType('!env', {
  kind: 'scalar',
  resolve(name: string) {
    if (Reflect.has(process.env, name)) {
      return true;
    } else {
      throw new BaseError(`environment variable not found: ${name}`);
    }
  },
  construct(name: string) {
    return Reflect.get(process.env, name);
  },
});

import { Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';

export const REGEXP_DELIMITER = '/';
export const REGEXP_REGEXP = /\/(.*)\/([gimuy]*)/;

export const regexpType = new YamlType('!regexp', {
  kind: 'scalar',
  resolve(value: string) {
    return REGEXP_REGEXP.test(value);
  },
  construct(value: string): RegExp {
    const match = REGEXP_REGEXP.exec(value);
    if (!match) {
      throw new BaseError('invalid regexp');
    }
    const [_, expr, flags] = Array.from(match);
    return new RegExp(expr, flags)
  }
});

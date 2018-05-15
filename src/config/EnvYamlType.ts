import { safeLoad, Type as YamlType } from 'js-yaml';

class EnvString {
  public readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  toString() {
    return process.env[this.key];
  }
}

export const EnvYamlType = new YamlType('!env', {
  kind: 'scalar',
  resolve(name: string) {
    return Reflect.has(process.env, name);
  },
  construct(key: string) {
    return new EnvString(key);
  },
  instanceOf: EnvString,
  represent(data: EnvString) {
    return data.key;
  }
});

import { safeLoad, Type as YamlType } from 'js-yaml';

export const EnvYamlType = new YamlType('!env', {
  kind: 'scalar',
  resolve(name: string) {
    return Reflect.has(process.env, name);
  },
  construct(name: string) {
    return Reflect.get(process.env, name);
  }
});

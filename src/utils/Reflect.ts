import { isFunction, isNil } from 'lodash';

import { doesExist } from '.';

export function getConstructor(val: object) {
  return val.constructor;
}

export function getMethods<TValue extends object>(value: TValue): Set<Function> {
  const methods = new Set<Function>();

  for (const name of Object.getOwnPropertyNames(value)) {
    const desc = Object.getOwnPropertyDescriptor(value, name);
    if (isNil(desc)) {
      continue;
    }

    const method = desc.value;
    if (isFunction(method)) {
      methods.add(method);
    }
  }

  const proto = Reflect.getPrototypeOf(value);
  if (proto !== value && doesExist(proto)) {
    for (const m of getMethods(proto)) {
      methods.add(m);
    }
  }

  return methods;
}

export function constructorName(val: object) {
  return getConstructor(Reflect.getPrototypeOf(val)).name;
}

import { Module } from 'noicejs';

export interface ExternalModule {
  data?: unknown;
  export: string;
  require: string;
}

export type ModuleCtor = new (data: unknown) => Module;

export function isModule(it: object): it is ModuleCtor {
  return Reflect.getPrototypeOf(it) instanceof Module;
}

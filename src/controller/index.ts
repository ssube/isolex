import { BaseController } from 'src/controller/BaseController';
import { ControllerData } from 'src/controller/Controller';
import { CommandVerb } from 'src/entity/Command';

export const SYMBOL_NOUN = Symbol('handle-noun');
export const SYMBOL_RBAC = Symbol('check-rbac');
export const SYMBOL_VERB = Symbol('handle-verb');

export function Handler(noun: string, verb: CommandVerb) {
  return (target: BaseController<ControllerData>, key: string, desc: PropertyDescriptor) => {
    Reflect.defineMetadata(SYMBOL_NOUN, noun, desc.value);
    Reflect.defineMetadata(SYMBOL_VERB, verb, desc.value);
  };
}

export interface RBACOptions {
  defaultGrant?: boolean;
  grants?: Array<string>;
  user?: boolean;
}

export function CheckRBAC(rbac: RBACOptions = {}) {
  return (target: BaseController<ControllerData>, key: string, desc: PropertyDescriptor) => {
    const {
      defaultGrant = true,
      grants = [],
      user = true,
    } = rbac;
    Reflect.defineMetadata(SYMBOL_RBAC, {
      defaultGrant,
      grants,
      user,
    }, desc.value);
  };
}

export interface HandlerOptions {
  noun: string;
  verb: CommandVerb;
  rbac?: RBACOptions;
}

export function getHandlerOptions(target: Function): HandlerOptions | undefined {
  if (!Reflect.hasMetadata(SYMBOL_NOUN, target)) {
    return;
  }

  if (!Reflect.hasMetadata(SYMBOL_VERB, target)) {
    return;
  }

  const noun = Reflect.getMetadata(SYMBOL_NOUN, target);
  const rbac = Reflect.getMetadata(SYMBOL_RBAC, target) as RBACOptions;
  const verb = Reflect.getMetadata(SYMBOL_VERB, target) as CommandVerb;
  return {
    noun,
    rbac,
    verb,
  };
}

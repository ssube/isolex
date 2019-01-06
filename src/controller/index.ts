import { BaseController } from 'src/controller/BaseController';
import { ControllerData } from 'src/controller/Controller';
import { CommandVerb } from 'src/entity/Command';

export const SYMBOL_HANDLER = Symbol('handler');
export const SYMBOL_RBAC = Symbol('check-rbac');

export function Handler(noun: string, verb: CommandVerb) {
  return (target: BaseController<ControllerData>, key: string, desc: PropertyDescriptor) => {
    Reflect.defineMetadata(SYMBOL_HANDLER, [noun, verb], desc.value);
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
  if (!Reflect.hasMetadata(SYMBOL_HANDLER, target)) {
    return;
  }

  const [noun, verb] = Reflect.getMetadata(SYMBOL_HANDLER, target) as [string, CommandVerb];
  const rbac = Reflect.getMetadata(SYMBOL_RBAC, target) as RBACOptions;
  return {
    noun,
    rbac,
    verb,
  };
}

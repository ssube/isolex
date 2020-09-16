import { BotServiceData } from '../BotService';
import { Command, CommandVerb } from '../entity/Command';
import { ContextRedirect } from '../entity/Context';
import { Service, ServiceDefinition } from '../Service';
import { TransformData } from '../transform';
import { BaseController } from './BaseController';

export interface ControllerData extends BotServiceData {
  redirect: ContextRedirect;
  transforms: Array<ServiceDefinition<TransformData>>;
}

/**
 * Controllers react to commands, consuming them before sending replies or performing background work.
 */
export interface Controller extends Service {
  check(cmd: Command): Promise<boolean>;

  /**
   * Handle a command, sending any replies.
   * @param cmd - the command to be handled
   * @returns true if the command was handled
   */
  handle(cmd: Command): Promise<void>;
}

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

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function getHandlerOptions(target: Function): HandlerOptions | undefined {
  if (Reflect.hasMetadata(SYMBOL_HANDLER, target) === false) {
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

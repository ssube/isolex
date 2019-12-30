import { Request, Response, Router } from 'express';
import passport from 'passport';

import { BotServiceData } from '../BotService';
import { CommandVerb } from '../entity/Command';
import { Service, ServiceDefinition } from '../Service';
import { TransformData } from '../transform';

export interface EndpointData extends BotServiceData {
  transforms: Array<ServiceDefinition<TransformData>>;
}

export interface RouterOptions {
  passport: passport.Authenticator;
  router?: Router;
}

export interface Endpoint extends Service {
  paths: Array<string>;

  createRouter(options: RouterOptions): Promise<Router>;
}

export interface HandlerMetadata {
  grants: Array<string>;
  path: string;
  verb: CommandVerb;
}

export type HandlerMethod = (req: Request, res: Response) => Promise<void>;

const HANDLER_KEY = Symbol('handler-metadata');
export function Handler(verb: CommandVerb, path: string, grants: Array<string> = []) {
  // this variable type-checks the metadata to be set
  const meta: HandlerMetadata = {
    grants,
    path,
    verb,
  };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (target: any, key: string, desc?: PropertyDescriptor) => {
    Reflect.set(target[key], HANDLER_KEY, meta);
  };
}

export function getHandlerMetadata(target: HandlerMethod): HandlerMetadata {
  return Reflect.get(target, HANDLER_KEY);
}

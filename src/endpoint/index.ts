import { Request, Response, Router } from 'express';
import { BaseError } from 'noicejs';

import { BotServiceData } from '../BotService';
import { CommandVerb } from '../entity/Command';
import { Service } from '../Service';

export type EndpointData = BotServiceData;

export interface Endpoint extends Service {
  paths: Array<string>;

  createRouter(): Promise<Router>;
}

export enum HttpVerb {
  Delete = 'DELETE',
  Get = 'GET',
  Head = 'HEAD',
  Options = 'OPTIONS',
  Post = 'POST',
  Put = 'PUT',
}

export function commandVerbFor(verb: HttpVerb): CommandVerb {
  switch (verb) {
    case HttpVerb.Delete: return CommandVerb.Delete;
    case HttpVerb.Get: return CommandVerb.Get;
    case HttpVerb.Head: return CommandVerb.List;
    case HttpVerb.Options: return CommandVerb.Help;
    case HttpVerb.Post: return CommandVerb.Create;
    case HttpVerb.Put: return CommandVerb.Update;
    default: throw new BaseError('unknown verb');
  }
}

export interface HandlerMetadata {
  path: string;
  verb: CommandVerb;
}

const HANDLER_KEY = Symbol('handler-metadata');
export function Handler(verb: CommandVerb, path: string) {
  // tslint:disable-next-line:no-any
  return (target: any, key: string, desc?: PropertyDescriptor) => {
    Reflect.set(target[key], HANDLER_KEY, {
      path,
      verb,
    });
  };
}

export function getHandlerMetadata(target: Handler): HandlerMetadata {
  return Reflect.get(target, HANDLER_KEY);
}

export type Handler = (req: Request, res: Response) => Promise<void>;

import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { BaseError, Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_SERVICES } from '../BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Endpoint, EndpointData, getHandlerMetadata, Handler, HandlerMetadata, RouterOptions } from '../endpoint';
import { CommandVerb } from '../entity/Command';
import { Context, ContextOptions } from '../entity/Context';
import { Listener } from '../listener';
import { getRequestContext } from '../listener/ExpressListener';
import { ServiceModule } from '../module/ServiceModule';
import { ServiceDefinition } from '../Service';
import { Transform, TransformData } from '../transform';
import { doesExist, getMethods, mustExist } from '../utils';

export const STATUS_FORBIDDEN = 403;

export interface BaseEndpointOptions<TData extends EndpointData> extends BotServiceOptions<TData> {
  listener: Listener;
}

@Inject(INJECT_STORAGE)
export abstract class BaseEndpoint<TData extends EndpointData> extends BotService<TData> implements Endpoint {
  protected readonly contextRepository: Repository<Context>;
  protected readonly listener: Listener;
  protected readonly services: ServiceModule;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseEndpointOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.contextRepository = mustExist(options[INJECT_STORAGE]).getRepository(Context);
    this.listener = options.listener;
    this.services = mustExist(options[INJECT_SERVICES]);
    this.transforms = [];
  }

  public get paths(): Array<string> {
    return [
      this.id,
      `${this.kind}/${this.name}`,
    ];
  }

  public async createRouter(options: RouterOptions): Promise<Router> {
    const {
      passport,
      router = Router(),
    } = options;

    const methods = getMethods(this) as Set<Handler>;
    for (const method of methods) {
      const metadata = getHandlerMetadata(method);
      this.logger.debug({ metadata, method: method.name }, 'checking method for handler metadata');
      if (doesExist(metadata)) {
        this.logger.debug({ metadata, method: method.name }, 'binding handler method');
        const bound = this.nextRoute(method.bind(this), metadata);
        if (metadata.grants.length > 0) {
          registerHandlers(router, metadata, [passport.authenticate('jwt'), bound]);
        } else {
          registerHandlers(router, metadata, [bound]);
        }
      }
    }
    return router;
  }

  public async start(): Promise<void> {
    await super.start();

    const transforms: Array<ServiceDefinition<TransformData>> = this.data.transforms;
    for (const def of transforms) {
      const transform = await this.services.createService<Transform, TransformData>(def);
      this.transforms.push(transform);
    }
  }

  protected async createContext(options: ContextOptions): Promise<Context> {
    const ctx = await this.contextRepository.save(new Context({
      ...options,
      // TODO: does this need source/target?
    }));
    this.logger.debug({ ctx }, 'endpoint saved new context');
    return ctx;
  }

  protected nextRoute(fn: (req: Request, res: Response) => Promise<void>, metadata: HandlerMetadata) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (this.routeGrant(req, metadata)) {
        fn(req, res).then(() => {
          this.logger.debug('finished calling handler');
          next();
        }).catch((err: Error) => {
          this.logger.error(err, 'error calling handler');
          next(err);
        });
      } else {
        res.sendStatus(STATUS_FORBIDDEN);
      }
    };
  }

  protected routeGrant(req: Request, metadata: HandlerMetadata) {
    if (metadata.grants.length > 0) {
      const ctx = getRequestContext(req);
      this.logger.debug({
        ctx,
        handlerGrants: metadata.grants,
        userGrants: ctx.listGrants(['*'])
      }, 'checking context for handler grants');
      return ctx.checkGrants(metadata.grants);
    } else {
      return true;
    }
  }
}

function registerHandlers(router: Router, metadata: HandlerMetadata, handlers: Array<RequestHandler>): Router {
  switch (metadata.verb) {
    case CommandVerb.Create:
      return router.post(metadata.path, ...handlers);
    case CommandVerb.Delete:
      return router.delete(metadata.path, ...handlers);
    case CommandVerb.Get:
      return router.get(metadata.path, ...handlers);
    case CommandVerb.Help:
      return router.options(metadata.path, ...handlers);
    case CommandVerb.List:
      return router.head(metadata.path, ...handlers);
    case CommandVerb.Update:
      return router.put(metadata.path, ...handlers);
    default:
      throw new BaseError('unknown verb');
  }
}

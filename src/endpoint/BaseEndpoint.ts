import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { BaseError, Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_SERVICES } from '../BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Endpoint, EndpointData, getHandlerMetadata, HandlerMetadata, HandlerMethod, RouterOptions } from '../endpoint';
import { CommandVerb } from '../entity/Command';
import { Context, ContextOptions } from '../entity/Context';
import { getRequestContext } from '../listener/ExpressListener';
import { ServiceModule } from '../module/ServiceModule';
import { ServiceDefinition } from '../Service';
import { Transform, TransformData } from '../transform';
import { doesExist, getMethods, mustExist } from '../utils';

export const STATUS_ERROR = 500;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOTFOUND = 404;
export const STATUS_SUCCESS = 200;
export const STATUS_UNKNOWN = 404;

export type BaseEndpointOptions<TData extends EndpointData> = BotServiceOptions<TData>;

@Inject(INJECT_STORAGE)
export abstract class BaseEndpoint<TData extends EndpointData> extends BotService<TData> implements Endpoint {
  protected readonly contextRepository: Repository<Context>;
  protected readonly services: ServiceModule;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseEndpointOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.contextRepository = mustExist(options[INJECT_STORAGE]).getRepository(Context);
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
      router = Router(),
    } = options;

    const methods = getMethods(this) as Set<HandlerMethod>;
    for (const method of methods) {
      const metadata = getHandlerMetadata(method);
      this.logger.debug({ metadata, method: method.name }, 'checking method for handler metadata');
      if (doesExist(metadata)) {
        this.logger.debug({ metadata, method: method.name }, 'binding handler method');
        registerHandlers(router, metadata, [
          ...this.getHandlerMiddleware(metadata, options),
          this.bindHandler(method, metadata),
        ]);
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

  /**
   * This inserts RBAC middleware if needed, but can be overridden by the sub-endpoint
   * to add custom middleware per-handler.
   */
  protected getHandlerMiddleware(metadata: HandlerMetadata, options: RouterOptions): Array<RequestHandler> {
    const middleware = [];
    if (metadata.grants.length > 0) {
      middleware.push(options.passport.authenticate('jwt'));
      middleware.push((req: Request, res: Response, next: NextFunction) => {
        if (this.routeGrant(req, metadata)) {
          next();
        } else {
          res.sendStatus(STATUS_FORBIDDEN);
        }
      });
    }
    return middleware;
  }

  protected async createContext(options: ContextOptions): Promise<Context> {
    const ctx = await this.contextRepository.save(new Context({
      ...options,
      // TODO: does this need source/target?
    }));
    this.logger.debug({ ctx }, 'endpoint saved new context');
    return ctx;
  }

  protected bindHandler(fn: HandlerMethod, metadata: HandlerMetadata) {
    const bound = fn.bind(this);
    return (req: Request, res: Response, next: NextFunction): void => {
      bound(req, res).then(() => {
        this.logger.debug('finished calling handler');
        next();
      }).catch((err: Error) => {
        this.logger.error(err, 'error calling handler');
        next(err);
      });
    };
  }

  protected routeGrant(req: Request, metadata: HandlerMetadata) {
    if (metadata.grants.length > 0) {
      const ctx = getRequestContext(req);
      this.logger.debug({
        ctx,
        handlerGrants: metadata.grants,
        userGrants: ctx.getGrants(),
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

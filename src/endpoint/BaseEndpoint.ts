import { NextFunction, Request, Response, Router } from 'express';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_SERVICES } from '../BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Endpoint, EndpointData, getHandlerMetadata, Handler } from '../endpoint';
import { CommandVerb } from '../entity/Command';
import { Context, ContextOptions } from '../entity/Context';
import { BaseListenerOptions } from '../listener/BaseListener';
import { ServiceModule } from '../module/ServiceModule';
import { ServiceDefinition } from '../Service';
import { Transform, TransformData } from '../transform';
import { doesExist, getMethods, mustExist } from '../utils';

export type BaseEndpointOptions<TData extends EndpointData> = BotServiceOptions<TData>;

@Inject(INJECT_STORAGE)
export abstract class BaseEndpoint<TData extends EndpointData> extends BotService<TData> implements Endpoint {
  protected readonly contextRepository: Repository<Context>;
  protected readonly services: ServiceModule;
  protected readonly transforms: Array<Transform>;

  constructor(options: BaseListenerOptions<TData>, schemaPath: string) {
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

  public async createRouter(router = Router()): Promise<Router> {
    const methods = getMethods(this) as Set<Handler>;
    for (const method of methods) {
      const metadata = getHandlerMetadata(method);
      this.logger.debug({ metadata, method: method.name }, 'checking method for handler metadata');
      if (doesExist(metadata)) {
        this.logger.debug({ metadata, method: method.name }, 'binding handler method');
        const bound = this.nextRoute(method);
        switch (metadata.verb) {
          case CommandVerb.Create:
            router.post(metadata.path, bound);
            break;
          case CommandVerb.Delete:
            router.delete(metadata.path, bound);
            break;
          case CommandVerb.Get:
            router.get(metadata.path, bound);
            break;
          case CommandVerb.Help:
            router.options(metadata.path, bound);
            break;
          case CommandVerb.List:
            router.head(metadata.path, bound);
            break;
          case CommandVerb.Update:
            router.put(metadata.path, bound);
            break;
          default:
            this.logger.error({ metadata }, 'unknown metadata verb');
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

  protected nextRoute(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res).then(() => {
        this.logger.debug('finished calling handler');
        next();
      }).catch((err: Error) => {
        this.logger.error(err, 'error calling handler');
        next();
      });
    };
  }
}

import { Router } from 'express';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_SERVICES } from '../BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from '../BotService';
import { Endpoint, EndpointData } from '../endpoint';
import { Context, ContextOptions } from '../entity/Context';
import { BaseListenerOptions } from '../listener/BaseListener';
import { ServiceModule } from '../module/ServiceModule';
import { ServiceDefinition } from '../Service';
import { Transform, TransformData } from '../transform';
import { mustExist } from '../utils';

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

  public abstract createRouter(): Promise<Router>;

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
}

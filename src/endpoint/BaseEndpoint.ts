import { Router } from 'express';
import { Inject } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_SERVICES } from 'src/BaseService';
import { BotService, BotServiceOptions, INJECT_STORAGE } from 'src/BotService';
import { Endpoint, EndpointData } from 'src/endpoint';
import { Context, ContextOptions } from 'src/entity/Context';
import { BaseListenerOptions } from 'src/listener/BaseListener';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceDefinition } from 'src/Service';
import { Transform, TransformData } from 'src/transform';
import { mustExist } from 'src/utils';

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

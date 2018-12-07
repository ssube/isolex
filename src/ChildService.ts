import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { BaseService } from './BaseService';
import { Bot } from './Bot';
import { Service, ServiceOptions } from './Service';
import { ServiceModule } from './module/ServiceModule';

interface ChildServiceDependencies {
  bot: Bot;
  metrics: Registry;
  services: ServiceModule;
  storage: Connection;
}

/**
 * Exposed injected services available to child services.
 */
export type ChildServiceOptions<TData> = ServiceOptions<TData> & ChildServiceDependencies;

export abstract class ChildService<TData> extends BaseService<TData> implements Service {
  public readonly bot: Bot;

  constructor(options: ChildServiceOptions<TData>) {
    super(options);

    this.bot = options.bot;
  }
}

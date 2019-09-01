import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_LOGGER, INJECT_SERVICES } from '../BaseService';
import { BotServiceData, BotServiceOptions } from '../BotService';
import { NotFoundError } from '../error/NotFoundError';
import { Service, ServiceDefinition, ServiceEvent, ServiceLifecycle, ServiceMetadata } from '../Service';
import { doesExist, mustExist } from '../utils';
import { timeout } from '../utils/Async';
import { kindLogger } from '../utils/logger';
import { mustGet } from '../utils/Map';

export interface ServiceModuleData {
  timeout: number;
}

/**
 * This is a magical half-module service locator
 */

export class ServiceModule extends Module implements ServiceLifecycle {
  protected readonly data: ServiceModuleData;
  protected readonly services: Map<string, Service>;

  constructor(data: ServiceModuleData) {
    super();

    this.data = data;
    this.services = new Map();
  }

  public get size(): number {
    return this.services.size;
  }

  public async notify(event: ServiceEvent) {
    for (const svc of this.services.values()) {
      await svc.notify(event);
    }
  }

  public async start() {
    for (const svc of this.services.values()) {
      try {
        await timeout(this.data.timeout, svc.start());
      } catch (err) {
        if (doesExist(this.logger)) {
          this.logger.error({ err }, 'error starting service');
        }
      }
    }
  }

  public async stop() {
    for (const svc of this.services.values()) {
      await svc.stop();
    }
    this.services.clear();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    if (doesExist(this.logger)) {
      this.logger.debug({ options }, 'configuring service module');
    }
  }

  @Provides(INJECT_SERVICES)
  public getServices() {
    if (doesExist(this.logger)) {
      this.logger.debug('getting services from service module');
    }

    return this;
  }

  public addService<TService extends Service>(svc: TService) {
    const { kind, name } = svc;
    const tag = `${kind}:${name}`;

    if (this.services.has(tag)) {
      if (doesExist(this.logger)) {
        this.logger.warn({ tag }, 'adding duplicate service');
      }
    } else {
      this.services.set(tag, svc);
    }
  }

  /**
   * These are all created the same way, so they should probably have a common base...
   */
  public async createService<TService extends Service, TData extends BotServiceData>(conf: ServiceDefinition<TData>): Promise<TService> {
    const container = mustExist(this.container);

    const { metadata: { kind, name } } = conf;
    const tag = `${kind}:${name}`;

    if (this.services.has(tag)) {
      if (doesExist(this.logger)) {
        this.logger.info({ kind, tag }, 'fetching existing service');
      }
      return mustGet(this.services, tag) as TService;
    }
    if (doesExist(this.logger)) {
      this.logger.info({ kind, tag }, 'creating unknown service');
    }
    const svc = await container.create<TService, BotServiceOptions<TData>>(kind, {
      ...conf,
      [INJECT_LOGGER]: kindLogger(mustExist(this.logger), kind),
      [INJECT_SERVICES]: this,
    });
    if (doesExist(this.logger)) {
      this.logger.debug({ id: svc.id, kind, tag }, 'service created');
    }
    this.services.set(tag, svc);

    return svc;
  }

  public getService<TService extends Service>(metadata: Partial<ServiceMetadata>): TService {
    for (const svc of this.services.values()) {
      if (svc.id === metadata.id || (svc.kind === metadata.kind && svc.name === metadata.name)) {
        return svc as TService;
      }
    }
    if (doesExist(this.logger)) {
      this.logger.error({ metadata }, 'service not found');
    }
    throw new NotFoundError(`service not found`);
  }

  public listServices() {
    if (doesExist(this.logger)) {
      this.logger.debug('listing services');
    }
    return this.services;
  }
}

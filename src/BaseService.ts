import { kebabCase } from 'lodash';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Registry } from 'prom-client';
import * as uuid from 'uuid/v4';

import { ServiceModule } from 'src/module/ServiceModule';
import { Service, ServiceDefinition } from 'src/Service';
import { dictToMap } from 'src/utils/Map';

export interface InjectedServiceOptions {
  logger: Logger;
  metrics: Registry;
  services: ServiceModule;
}
export type BaseServiceOptions<TData> = BaseOptions & ServiceDefinition<TData> & InjectedServiceOptions;

export abstract class BaseService<TData> implements Service {
  public readonly id: string;
  public readonly kind: string;
  public readonly labels: Map<string, string>;
  public readonly name: string;

  protected readonly data: Readonly<TData>;
  protected readonly logger: Logger;

  constructor(options: BaseServiceOptions<TData>) {
    this.id = uuid();
    this.kind = options.metadata.kind;
    this.labels = dictToMap(options.metadata.labels);
    this.name = options.metadata.name;

    this.data = options.data;

    // check this, because bunyan will throw if it is missing
    if (!this.name) {
      throw new Error('missing service name');
    }

    this.logger = options.logger.child({
      kind: kebabCase(Reflect.getPrototypeOf(this).constructor.name),
      service: options.metadata.name,
    });
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

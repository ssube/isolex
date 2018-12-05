import { Logger } from 'noicejs/logger/Logger';
import * as uuid from 'uuid/v4';

import { Service, ServiceOptions } from 'src/Service';
import { dictToMap } from './utils/Map';

export abstract class BaseService<TData> implements Service {
  public readonly id: string;
  public readonly kind: string;
  public readonly labels: Map<string, string>;
  public readonly name: string;

  protected readonly data: Readonly<TData>;
  protected readonly logger: Logger;

  constructor(options: ServiceOptions<TData>) {
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
      class: Reflect.getPrototypeOf(this).constructor.name,
      service: options.metadata.name,
    });
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

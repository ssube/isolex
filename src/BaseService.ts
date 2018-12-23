import { kebabCase } from 'lodash';
import { MissingValueError } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Registry } from 'prom-client';
import * as uuid from 'uuid/v4';

import { SchemaError } from 'src/error/SchemaError';
import { ServiceModule } from 'src/module/ServiceModule';
import { Service, ServiceDefinition, ServiceLifecycle } from 'src/Service';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { dictToMap } from 'src/utils/Map';
import { MathFactory } from 'src/utils/Math';
import { Schema } from 'src/utils/Schema';

export interface InjectedServiceOptions {
  clock: Clock;
  jsonpath: JsonPath;
  logger: Logger;
  math: MathFactory;
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

  constructor(options: BaseServiceOptions<TData>, schemaPath: string) {
    this.id = uuid();
    this.kind = options.metadata.kind;
    this.labels = dictToMap(options.metadata.labels);
    this.name = options.metadata.name;

    this.data = options.data;

    // check this, because bunyan will throw if it is missing
    if (!this.name) {
      throw new MissingValueError('missing service name');
    }

    this.logger = options.logger.child({
      kind: kebabCase(Reflect.getPrototypeOf(this).constructor.name),
      service: options.metadata.name,
    });

    // validate the data
    // @TODO: inject this schema
    const schema = new Schema();
    const result = schema.match(options.data, schemaPath);
    if (!result.valid) {
      this.logger.error({ errors: result.errors }, 'failed to validate config');
      throw new SchemaError('failed to validate config');
    } else {
      this.logger.debug('validated config data');
    }
  }

  public async notify(event: ServiceLifecycle): Promise<void> {
    this.logger.debug({ event }, 'service notified of event');
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  protected getId(persistent: boolean = false): string {
    if (persistent) {
      return `${this.kind}:${this.name}`;
    } else {
      return this.id;
    }
  }
}

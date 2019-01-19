import { BaseOptions, Inject, Logger, MissingValueError } from 'noicejs';
import { Registry } from 'prom-client';
import * as uuid from 'uuid/v4';

import { SchemaError } from 'src/error/SchemaError';
import { ServiceModule } from 'src/module/ServiceModule';
import { Schema } from 'src/schema';
import { Service, ServiceDefinition, ServiceEvent } from 'src/Service';
import { mustExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { serviceLogger } from 'src/utils/logger';
import { dictToMap } from 'src/utils/Map';
import { MathFactory } from 'src/utils/Math';
import { RequestFactory } from 'src/utils/Request';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export const INJECT_CLOCK = Symbol('inject-clock');
export const INJECT_JSONPATH = Symbol('inject-jsonpath');
export const INJECT_LOGGER = Symbol('inject-logger');
export const INJECT_MATH = Symbol('inject-math');
export const INJECT_METRICS = Symbol('inject-metrics');
export const INJECT_REQUEST = Symbol('inject-request');
export const INJECT_SCHEMA = Symbol('inject-schema');
export const INJECT_SERVICES = Symbol('inject-services');
export const INJECT_TEMPLATE = Symbol('inject-template');

export interface InjectedServiceOptions {
  [INJECT_CLOCK]?: Clock;
  [INJECT_JSONPATH]?: JsonPath;
  [INJECT_LOGGER]?: Logger;
  [INJECT_MATH]?: MathFactory;
  [INJECT_METRICS]?: Registry;
  [INJECT_REQUEST]?: RequestFactory;
  [INJECT_SCHEMA]?: Schema;
  [INJECT_SERVICES]?: ServiceModule;
  [INJECT_TEMPLATE]?: TemplateCompiler;
}

// tslint:disable-next-line:no-any
export type BaseServiceData = any;

export type BaseServiceOptions<TData extends BaseServiceData> = BaseOptions & ServiceDefinition<TData> & InjectedServiceOptions;

@Inject(INJECT_SCHEMA, INJECT_SERVICES)
export abstract class BaseService<TData extends BaseServiceData> implements Service {
  public readonly id: string;
  public readonly kind: string;
  public readonly labels: Map<string, string>;
  public readonly name: string;

  protected readonly data: Readonly<TData>;
  protected readonly logger: Logger;
  protected readonly services: ServiceModule;

  constructor(options: BaseServiceOptions<TData>, schemaPath: string) {
    // check this, because bunyan will throw if it is missing
    if (options.metadata.name === '') {
      throw new MissingValueError('missing service name');
    }

    this.id = uuid();
    this.kind = options.metadata.kind;
    this.labels = dictToMap(options.metadata.labels);
    this.name = options.metadata.name;

    this.data = options.data;
    this.services = mustExist(options[INJECT_SERVICES]);

    this.logger = serviceLogger(mustExist(options[INJECT_LOGGER]), this);

    // validate the data
    const result = mustExist(options[INJECT_SCHEMA]).match(options.data, schemaPath);
    if (!result.valid) {
      this.logger.error({ data: options.data, errors: result.errors }, 'failed to validate config');
      throw new SchemaError('failed to validate config');
    } else {
      this.logger.debug('validated config data');
    }
  }

  public async notify(event: ServiceEvent): Promise<void> {
    this.logger.debug({ event }, 'service notified of event');
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public getId(persistent: boolean = false): string {
    if (persistent) {
      return `${this.kind}:${this.name}`;
    } else {
      return this.id;
    }
  }
}

import { isNil, kebabCase } from 'lodash';
import { Inject, MissingValueError } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Registry } from 'prom-client';
import * as uuid from 'uuid/v4';

import { SchemaError } from 'src/error/SchemaError';
import { checkFilter, Filter, FilterData, FilterValue } from 'src/filter/Filter';
import { ServiceModule } from 'src/module/ServiceModule';
import { Schema } from 'src/schema';
import { Service, ServiceDefinition, ServiceEvent } from 'src/Service';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { dictToMap } from 'src/utils/Map';
import { MathFactory } from 'src/utils/Math';
import { RequestFactory } from 'src/utils/Request';

/**
 * TODO: these should be optional and must be included in the decorator to be available
 */
export interface InjectedServiceOptions {
  clock: Clock;
  jsonpath: JsonPath;
  logger: Logger;
  math: MathFactory;
  metrics: Registry;
  request: RequestFactory;
  schema: Schema;
  services: ServiceModule;
}

export interface BaseServiceData {
  filters: Array<ServiceDefinition<FilterData>>;
  strict: boolean;
}

export type BaseServiceOptions<TData extends BaseServiceData> = BaseOptions & ServiceDefinition<TData> & InjectedServiceOptions;

@Inject('schema', 'services')
export abstract class BaseService<TData extends BaseServiceData> implements Service {
  public readonly id: string;
  public readonly kind: string;
  public readonly labels: Map<string, string>;
  public readonly name: string;

  protected readonly data: Readonly<TData>;
  protected readonly filters: Array<Filter>;
  protected readonly logger: Logger;
  protected readonly services: ServiceModule;

  constructor(options: BaseServiceOptions<TData>, schemaPath: string) {
    this.id = uuid();
    this.kind = options.metadata.kind;
    this.labels = dictToMap(options.metadata.labels);
    this.name = options.metadata.name;

    this.data = options.data;
    this.filters = [];
    this.services = options.services;

    // check this, because bunyan will throw if it is missing
    if (isNil(this.name) || this.name === '') {
      throw new MissingValueError('missing service name');
    }

    this.logger = options.logger.child({
      kind: kebabCase(Reflect.getPrototypeOf(this).constructor.name),
      service: options.metadata.name,
    });

    // validate the data
    const result = options.schema.match(options.data, schemaPath);
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

  public async start() {
    const filters = this.data.filters;
    this.logger.info('setting up filters');
    for (const def of filters) {
      const filter = await this.services.createService<Filter, FilterData>(def);
      this.filters.push(filter);
    }
  }

  public async stop() {
    this.filters.length = 0;
  }

  protected getId(persistent: boolean = false): string {
    if (persistent) {
      return `${this.kind}:${this.name}`;
    } else {
      return this.id;
    }
  }

  protected async checkFilters(value: FilterValue, filters: Array<Filter>): Promise<boolean> {
    for (const filter of filters) {
      const result = await filter.check(value);
      this.logger.debug({ result }, 'checked filter');

      if (!checkFilter(result, this.data.strict)) {
        return false;
      }
    }

    return true;
  }
}

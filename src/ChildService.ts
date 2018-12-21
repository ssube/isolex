import { Connection } from 'typeorm';

import { BaseService, BaseServiceOptions } from './BaseService';
import { Bot } from './Bot';
import { Service } from './Service';

/**
 * Exposed injected services available to child services.
 */
export interface ChildServiceOptions<TData> extends BaseServiceOptions<TData> {
  bot: Bot;
  storage: Connection;
}

export abstract class ChildService<TData> extends BaseService<TData> implements Service {
  public readonly bot: Bot;

  constructor(options: ChildServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.bot = options.bot;
  }
}

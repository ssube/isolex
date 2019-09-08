import { Inject } from 'noicejs';

import { BaseService, BaseServiceData, BaseServiceOptions, INJECT_SERVICES } from './BaseService';
import { Bot } from './Bot';
import { Context } from './entity/Context';
import { checkFilter, Filter, FilterData, FilterValue } from './filter';
import { Locale } from './locale';
import { Service, ServiceDefinition } from './Service';
import { Storage } from './storage';
import { mustExist } from './utils';

export interface BotServiceData extends BaseServiceData {
  filters: Array<ServiceDefinition<FilterData>>;
  strict: boolean;
}

export const INJECT_BOT = Symbol('inject-bot');
export const INJECT_LOCALE = Symbol('inject-locale');
export const INJECT_STORAGE = Symbol('inject-storage');

/**
 * Exposed injected services available to child services.
 */
export interface BotServiceOptions<TData extends BotServiceData> extends BaseServiceOptions<TData> {
  [INJECT_BOT]?: Bot;
  [INJECT_LOCALE]?: Locale;
  [INJECT_STORAGE]?: Storage;
}

/**
 * Services started by the bot, into which the bot is injected, and which rely on the bot for communication with
 * other services and the outside world.
 */
@Inject(INJECT_BOT, INJECT_SERVICES)
export abstract class BotService<TData extends BotServiceData> extends BaseService<TData> implements Service {
  protected readonly bot: Bot;
  protected readonly filters: Array<Filter>;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.bot = mustExist(options[INJECT_BOT]);
    this.filters = [];
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

  /**
   * Check a set of grants **after** scoping them to this service.
   */
  protected checkGrants(ctx: Context, ...stubGrants: Array<string>): boolean {
    return ctx.checkGrants(stubGrants.map((s) => `${this.kind}:${this.name}:${s}`));
  }
}

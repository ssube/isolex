import { Inject } from 'noicejs';
import { Connection } from 'typeorm';

import { BaseService, BaseServiceData, BaseServiceOptions } from 'src/BaseService';
import { Bot } from 'src/Bot';
import { Context } from 'src/entity/Context';
import { Locale } from 'src/locale';
import { Service } from 'src/Service';

export type BotServiceData = BaseServiceData;

export const INJECT_BOT = Symbol('inject-bot');
export const INJECT_LOCALE = Symbol('inject-locale');
export const INJECT_STORAGE = Symbol('inject-storage');

/**
 * Exposed injected services available to child services.
 */
export interface BotServiceOptions<TData extends BotServiceData> extends BaseServiceOptions<TData> {
  [INJECT_BOT]: Bot;
  [INJECT_LOCALE]: Locale;
  [INJECT_STORAGE]: Connection;
}

/**
 * Services started by the bot, into which the bot is injected, and which rely on the bot for communication with
 * other services and the outside world.
 */
@Inject(INJECT_BOT, 'services')
export abstract class BotService<TData extends BotServiceData> extends BaseService<TData> implements Service {
  public readonly bot: Bot;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.bot = options[INJECT_BOT];
  }

  /**
   * Check a set of grants **after** scoping them to this service.
   */
  protected checkGrants(ctx: Context, ...stubGrants: Array<string>): boolean {
    return ctx.checkGrants(stubGrants.map((s) => `${this.kind}:${this.name}:${s}`));
  }
}

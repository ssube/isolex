import { Connection } from 'typeorm';

import { BaseService, BaseServiceOptions } from 'src/BaseService';
import { Bot } from 'src/Bot';
import { Service } from 'src/Service';

/**
 * Exposed injected services available to child services.
 */
export interface BotServiceOptions<TData> extends BaseServiceOptions<TData> {
  bot: Bot;
  storage: Connection;
}

/**
 * Services started by the bot, into which the bot is injected, and which rely on the bot for communication with
 * other services and the outside world.
 */
export abstract class BotService<TData> extends BaseService<TData> implements Service {
  public readonly bot: Bot;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.bot = options.bot;
  }
}

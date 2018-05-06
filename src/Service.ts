import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';

export interface ServiceOptions<TConfig> extends BaseOptions {
  bot: Bot;
  config: TConfig;
  logger: Logger;
}

export interface Service {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export abstract class BaseService<TConfig> {
  protected bot: Bot;
  protected config: TConfig;
  protected logger: Logger;

  constructor(options: ServiceOptions<TConfig>) {
    this.bot = options.bot;
    this.config = options.config;
    this.logger = options.logger.child({
      class: Reflect.getPrototypeOf(this).constructor.name
    });
  }
}

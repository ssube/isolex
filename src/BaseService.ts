import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { ServiceOptions } from 'src/Service';
import * as uuid from 'uuid/v4';

export abstract class BaseService<TConfig> {
  public readonly id: string;

  protected bot: Bot;
  protected config: TConfig;
  protected logger: Logger;

  constructor(options: ServiceOptions<TConfig>) {
    this.bot = options.bot;
    this.config = options.config;
    this.id = uuid();
    this.logger = options.logger.child({
      class: Reflect.getPrototypeOf(this).constructor.name
    });
  }
}

import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Service, ServiceConfig, ServiceOptions } from 'src/Service';
import * as uuid from 'uuid/v4';

export abstract class BaseService<TConfig extends ServiceConfig> implements Service {
  public readonly id: string;
  public readonly name: string;

  protected bot: Bot;
  protected config: TConfig;
  protected logger: Logger;

  constructor(options: ServiceOptions<TConfig>) {
    this.bot = options.bot;
    this.config = options.config;
    this.id = uuid();
    this.name = options.config.name;

    // check this, because bunyan will throw if it is missing
    if (!this.name) {
      throw new Error('missing service name');
    }

    this.logger = options.logger.child({
      class: Reflect.getPrototypeOf(this).constructor.name,
      service: options.config.name
    });
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

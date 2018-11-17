import { Logger, Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import * as request from 'request-promise';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends Module {
  protected bot: Bot;
  protected logger: Logger;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    // utils
    this.bind('compiler').toConstructor(TemplateCompiler);
  }

  public setBot(bot: Bot) {
    this.bot = bot;
  }

  @Provides('bot')
  protected async createBot(options: any): Promise<Bot> {
    return this.bot;
  }

  @Provides('logger')
  protected async createLogger(options: any): Promise<Logger> {
    return this.logger;
  }

  @Provides('storage')
  protected async createStorage(options: any): Promise<Connection> {
    return this.bot.getStorage();
  }

  @Provides('request')
  protected async createRequest(options: any): Promise<Request> {
    return request(options);
  }
}

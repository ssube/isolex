import { Container, Logger, ModuleOptions, Provides } from 'noicejs';
import { Registry } from 'prom-client';

import {
  INJECT_CLOCK,
  INJECT_JSONPATH,
  INJECT_LOGGER,
  INJECT_MATH,
  INJECT_METRICS,
  INJECT_REQUEST,
  INJECT_SCHEMA,
  INJECT_TEMPLATE,
} from 'src/BaseService';
import { Bot } from 'src/Bot';
import { INJECT_BOT, INJECT_LOCALE, INJECT_STORAGE } from 'src/BotService';
import { Locale } from 'src/locale';
import { BaseModule } from 'src/module/BaseModule';
import { Schema } from 'src/schema';
import { GraphSchema } from 'src/schema/graph';
import { Storage } from 'src/storage';
import { mustExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { MathFactory } from 'src/utils/Math';
import { RequestFactory } from 'src/utils/Request';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends BaseModule {
  protected bot?: Bot;
  protected container?: Container;
  protected logger: Logger;
  protected metrics?: Registry;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.container = options.container;
    this.metrics = new Registry();

    this.bindService(GraphSchema);

    // utils
    this.bind(INJECT_TEMPLATE).toConstructor(TemplateCompiler);
    this.bind(INJECT_CLOCK).toConstructor(Clock);
    this.bind(INJECT_JSONPATH).toConstructor(JsonPath);
    this.bind(INJECT_MATH).toConstructor(MathFactory);
    this.bind(INJECT_REQUEST).toConstructor(RequestFactory);
  }

  public setBot(bot: Bot) {
    this.bot = bot;
  }

  @Provides(INJECT_BOT)
  public async getBot(): Promise<Bot> {
    return mustExist(this.bot);
  }

  @Provides(INJECT_LOCALE)
  public async getLocale(): Promise<Locale> {
    const bot = await this.getBot();
    return bot.getLocale();
  }

  @Provides(INJECT_LOGGER)
  public async getLogger(): Promise<Logger> {
    return this.logger;
  }

  @Provides(INJECT_METRICS)
  public async getMetrics(): Promise<Registry> {
    return mustExist(this.metrics);
  }

  @Provides(INJECT_SCHEMA)
  public async getSchema(): Promise<Schema> {
    return new Schema();
  }

  @Provides(INJECT_STORAGE)
  public async getStorage(): Promise<Storage> {
    const bot = await this.getBot();
    return bot.getStorage();
  }
}

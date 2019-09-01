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
} from '../BaseService';
import { Bot } from '../Bot';
import { INJECT_BOT, INJECT_LOCALE, INJECT_STORAGE } from '../BotService';
import { Locale } from '../locale';
import { Schema } from '../schema';
import { GraphSchema } from '../schema/graph';
import { Storage } from '../storage';
import { mustExist } from '../utils';
import { Clock } from '../utils/Clock';
import { JsonPath } from '../utils/JsonPath';
import { MathFactory } from '../utils/Math';
import { RequestFactory } from '../utils/Request';
import { TemplateCompiler } from '../utils/TemplateCompiler';
import { BaseModule } from './BaseModule';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends BaseModule {
  public container?: Container;
  public logger?: Logger;

  protected bot?: Bot;
  protected metrics?: Registry;
  protected schema?: Schema;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.container = options.container;
    this.metrics = new Registry();
    this.schema = new Schema();

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
    return mustExist(this.logger);
  }

  @Provides(INJECT_METRICS)
  public async getMetrics(): Promise<Registry> {
    return mustExist(this.metrics);
  }

  @Provides(INJECT_SCHEMA)
  public async getSchema(): Promise<Schema> {
    return mustExist(this.schema);
  }

  @Provides(INJECT_STORAGE)
  public async getStorage(): Promise<Storage> {
    const bot = await this.getBot();
    return bot.getStorage();
  }
}

import { kebabCase } from 'lodash';
import { Container, Logger, Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import * as request from 'request-promise';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { Schema } from 'src/schema';
import { GraphSchema } from 'src/schema/graph';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { MathFactory } from 'src/utils/Math';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends Module {
  protected bot: Bot;
  protected container: Container;
  protected logger: Logger;
  protected metrics: Registry;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
    this.metrics = new Registry();
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.container = options.container;

    // utils
    this.bind('compiler').toConstructor(TemplateCompiler);
    this.bind(kebabCase(Clock.name)).toConstructor(Clock);
    this.bind(kebabCase(GraphSchema.name)).toConstructor(GraphSchema);
    this.bind('jsonpath').toConstructor(JsonPath);
    this.bind('math').toConstructor(MathFactory);
  }

  public setBot(bot: Bot) {
    this.bot = bot;
  }

  @Provides('bot')
  public async getBot(options: any): Promise<Bot> {
    return this.bot;
  }

  @Provides('logger')
  public async getLogger(options: any): Promise<Logger> {
    return this.logger;
  }

  @Provides('metrics')
  public async getMetrics(options: any): Promise<Registry> {
    return this.metrics;
  }

  @Provides('schema')
  public async getSchema(options: any): Promise<Schema> {
    return new Schema();
  }

  @Provides('storage')
  public async getStorage(options: any): Promise<Connection> {
    return this.bot.getStorage();
  }

  @Provides('request')
  public async createRequest(options: any): Promise<Request> {
    return request(options);
  }
}

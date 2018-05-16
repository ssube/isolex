import { kebabCase } from 'lodash';
import { Logger, Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import * as request from 'request-promise';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Trigger } from 'src/entity/Trigger';
import { UserFilter } from 'src/filter/UserFilter';
import { DiceHandler } from 'src/handler/DiceHandler';
import { EchoHandler } from 'src/handler/EchoHandler';
import { LearnHandler } from 'src/handler/LearnHandler';
import { MathHandler } from 'src/handler/MathHandler';
import { RandomHandler } from 'src/handler/RandomHandler';
import { ReactionHandler } from 'src/handler/ReactionHandler';
import { SearchHandler } from 'src/handler/SearchHandler';
import { SedHandler } from 'src/handler/SedHandler';
import { TimeHandler } from 'src/handler/TimeHandler';
import { WeatherHandler } from 'src/handler/WeatherHandler';
import { DiscordListener } from 'src/listener/DiscordListener';
import { SOListener } from 'src/listener/SOListener';
import { EchoParser } from 'src/parser/EchoParser';
import { LexParser } from 'src/parser/LexParser';
import { SplitParser } from 'src/parser/SplitParser';
import { YamlParser } from 'src/parser/YamlParser';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { Connection } from 'typeorm';
import { MapParser } from '../parser/MapParser';

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

    // filters
    this.bind(kebabCase(UserFilter.name)).toConstructor(UserFilter);

    // handlers
    this.bind(kebabCase(DiceHandler.name)).toConstructor(DiceHandler);
    this.bind(kebabCase(EchoHandler.name)).toConstructor(EchoHandler);
    this.bind(kebabCase(LearnHandler.name)).toConstructor(LearnHandler);
    this.bind(kebabCase(MathHandler.name)).toConstructor(MathHandler);
    this.bind(kebabCase(RandomHandler.name)).toConstructor(RandomHandler);
    this.bind(kebabCase(ReactionHandler.name)).toConstructor(ReactionHandler);
    this.bind(kebabCase(SedHandler.name)).toConstructor(SedHandler);
    this.bind(kebabCase(SearchHandler.name)).toConstructor(SearchHandler);
    this.bind(kebabCase(TimeHandler.name)).toConstructor(TimeHandler);
    this.bind(kebabCase(WeatherHandler.name)).toConstructor(WeatherHandler);

    // listeners
    this.bind(kebabCase(DiscordListener.name)).toConstructor(DiscordListener);
    this.bind(kebabCase(SOListener.name)).toConstructor(SOListener);

    // parsers
    this.bind(kebabCase(EchoParser.name)).toConstructor(EchoParser);
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
    this.bind(kebabCase(MapParser.name)).toConstructor(MapParser);
    this.bind(kebabCase(SplitParser.name)).toConstructor(SplitParser);
    this.bind(kebabCase(YamlParser.name)).toConstructor(YamlParser);
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

  @Provides('entities')
  protected async createEntities(): Promise<Array<Function>> {
    return [Command, Context, Message, Trigger];
  }
}

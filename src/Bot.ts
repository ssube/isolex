import * as bunyan from 'bunyan';
import { CronJob } from 'cron';
import { kebabCase } from 'lodash';
import { Container, Inject, Module, Provides } from 'noicejs';
import { ContainerOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
import { RequestAPI } from 'request';
import * as request from 'request-promise';
import { Observable, Subject } from 'rxjs';
import { Command, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { UserFilter, UserFilterConfig } from 'src/filter/UserFilter';
import { DiceHandler } from 'src/handler/DiceHandler';
import { EchoHandler, EchoHandlerConfig } from 'src/handler/EchoHandler';
import { Handler } from 'src/handler/Handler';
import { MathHandler } from 'src/handler/MathHandler';
import { RandomHandler } from 'src/handler/RandomHandler';
import { ReactionHandler } from 'src/handler/ReactionHandler';
import { SedHandler } from 'src/handler/SedHandler';
import { TimeHandler, TimeHandlerConfig } from 'src/handler/TimeHandler';
import { WeatherHandler } from 'src/handler/WeatherHandler';
import { DiscordListener } from 'src/listener/DiscordListener';
import { Listener, ContextFetchOptions } from 'src/listener/Listener';
import { SOListener } from 'src/listener/SOListener';
import { EchoParser } from 'src/parser/EchoParser';
import { LexParser, LexParserConfig } from 'src/parser/LexParser';
import { Parser } from 'src/parser/Parser';
import { SplitParser } from 'src/parser/SplitParser';
import { YamlParser, YamlParserConfig } from 'src/parser/YamlParser';
import { Service } from 'src/Service';
import { Cooldown } from 'src/utils/Cooldown';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';
import { Connection, ConnectionOptions, createConnection, Entity } from 'typeorm';

export interface BotConfig {
  bot: {
    name: string;
  };
  filters: Array<any>;
  handlers: Array<any>;
  intervals: Array<{
    cron: string;
    data: Array<CommandOptions>;
  }>;
  listeners: Array<any>;
  logger: {
    name: string;
    [other: string]: string;
  };
  parsers: Array<any>;
  storage: ConnectionOptions;
}

export interface BotOptions {
  config: BotConfig;
  container: Container;
  logger: Logger;
}

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
    this.bind(kebabCase(MathHandler.name)).toConstructor(MathHandler);
    this.bind(kebabCase(RandomHandler.name)).toConstructor(RandomHandler);
    this.bind(kebabCase(ReactionHandler.name)).toConstructor(ReactionHandler);
    this.bind(kebabCase(SedHandler.name)).toConstructor(SedHandler);
    this.bind(kebabCase(TimeHandler.name)).toConstructor(TimeHandler);
    this.bind(kebabCase(WeatherHandler.name)).toConstructor(WeatherHandler);

    // listeners
    this.bind(kebabCase(DiscordListener.name)).toConstructor(DiscordListener);

    // parsers
    this.bind(kebabCase(EchoParser.name)).toConstructor(EchoParser);
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
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
    this.logger.debug({ options }, 'creating request');
    return request(options);
  }

  @Provides('entities')
  protected async createEntities(): Promise<Array<Function>> {
    return [Command, Context, Message];
  }
}

@Inject('logger')
export class Bot {
  protected config: BotConfig;
  protected commands: Subject<Command>;
  protected container: Container;
  protected logger: Logger;
  protected storage: Connection;
  protected strict: boolean;
  protected timers: Set<CronJob>;

  // services
  protected filters: Array<Filter>;
  protected handlers: Array<Handler>;
  protected listeners: Array<Listener>;
  protected parsers: Array<Parser>;

  // message observables
  protected incoming: Subject<Message>;
  protected outgoing: Subject<Message>;

  constructor(options: BotOptions) {
    this.config = options.config;
    this.container = options.container;
    this.logger = options.logger.child({
      class: Bot.name
    });
    this.logger.info(options, 'starting bot');

    // set up deps
    this.filters = [];
    this.handlers = [];
    this.listeners = [];
    this.parsers = [];

    // set up streams
    this.commands = new Subject();
    this.incoming = new Subject();
    this.outgoing = new Subject();

    // set up crons
    this.timers = new Set();
  }

  public getStorage(): Connection {
    return this.storage;
  }

  /**
   * Set up the async resources that cannot be created in the constructor: filters, handlers, parsers, etc
   */
  public async start() {
    this.logger.info('setting up streams');
    this.commands.subscribe((next) => this.handle(next).catch((err) => this.looseError(err)));
    this.incoming.subscribe((next) => this.receive(next).catch((err) => this.looseError(err)));
    this.outgoing.subscribe((next) => this.dispatch(next).catch((err) => this.looseError(err)));

    this.logger.info('connecting to storage');
    const entities = await this.container.create<Array<Function>, any>('entities');
    this.storage = await createConnection({
      ...this.config.storage,
      entities,
      logger: {
        log: (level: string, message: any) => {
          // @todo make this log at the appropriate level
          this.logger.debug({ level }, message);
        },
        logMigration: (migration: string) => {
          this.logger.info({ migration }, 'orm running migration');
        },
        logQuery: (query: string, params?: Array<any>) => {
          this.logger.debug({ params, query }, 'orm logged query');
        },
        logQueryError: (error: string, query: string, params?: Array<any>) => {
          this.logger.warn({ error, params, query }, 'orm logged query error');
        },
        logQuerySlow: (time: number, query: string, params?: Array<any>) => {
          this.logger.warn({ params, query, time }, 'orm logged slow query');
        },
        logSchemaBuild: (schema: string) => {
          this.logger.info({ schema }, 'orm building schema');
        }
      }
    });

    this.logger.info('setting up filters');
    for (const filterData of this.config.filters) {
      const { type, ...config } = filterData;
      this.logger.debug({ filter: filterData }, 'configuring filter');
      const filter = await this.createPart<Filter>(type, config);
      this.filters.push(filter);
    }

    this.logger.info('setting up handlers');
    for (const handlerData of this.config.handlers) {
      const { type, ...config } = handlerData;
      this.logger.debug({ handler: handlerData }, 'configuring handler');
      const handler = await this.createPart<Handler>(type, config);
      this.handlers.push(handler);
    }

    this.logger.info('setting up intervals');
    for (const intervalData of this.config.intervals) {
      this.logger.debug({ interval: intervalData }, 'configuring interval');
      const cron = new CronJob(intervalData.cron, async () => {
        for (const data of intervalData.data) {
          const cmd = Command.create(data);
          this.commands.next(cmd);
        }
      });
      this.timers.add(cron);
    }

    this.logger.info('setting up listeners');
    for (const listenerData of this.config.listeners) {
      const { type, ...config } = listenerData;
      this.logger.debug({ listener: listenerData }, 'configuring listener');
      const listener = await this.createPart<Listener>(type, config);
      this.listeners.push(listener);
    }

    this.logger.info('setting up parsers');
    for (const parserData of this.config.parsers) {
      const { type, ...config } = parserData;
      this.logger.debug({ parser: parserData }, 'configuring parser');
      const parser = await this.createPart<Parser>(type, config);
      this.parsers.push(parser);
    }

    this.logger.info('starting listeners');
    for (const listener of this.listeners) {
      await listener.start();
    }

    this.logger.info('bot is ready');
  }

  public async stop() {
    this.logger.info('stopping bot');

    this.logger.debug('stopping cron timers');
    for (const timer of this.timers) {
      timer.stop();
    }
    this.timers.clear();

    this.logger.debug('stopping streams');
    this.commands.complete();
    this.incoming.complete();
    this.outgoing.complete();
  }

  /**
   * Receive an incoming message and turn it into commands.
   */
  public async receive(msg: Message) {
    this.logger.debug({ msg }, 'received incoming message');

    if (!await this.checkFilters(msg)) {
      this.logger.warn({ msg }, 'dropped incoming message due to filters');
      return;
    }

    let matched = false;
    for (const parser of this.parsers) {
      try {
        if (await parser.match(msg)) {
          matched = true;
          const commands = await parser.parse(msg);
          for (const cmd of commands) {
            this.commands.next(cmd);
          }
        }
      } catch (err) {
        this.logger.error(err, 'error running parser');
      }
    }

    if (!matched) {
      this.logger.debug({ msg }, 'incoming message was not matched by any parsers');
    }
  }

  /**
   * Fetches messages using a specified listener.
   */
  public async fetch(options: ContextFetchOptions) {
    const listener = this.listeners.find((listener) => listener.id === options.listenerId);
    if (!listener) {
      throw new Error('Could not find listener with given id.');
    }

    const messages = await listener.fetch(options);
    if (options.useFilters) {
      const filtered: Array<Message> = [];
      for (const message of messages) {
        if (await this.checkFilters(message)) {
          filtered.push(message);
        }
      }

      return filtered;
    }

    return messages;
  }

  /**
   * Handle a command using the appropriate handler.
   */
  public async handle(cmd: Command) {
    this.logger.debug({ cmd }, 'handling command');

    if (!await this.checkFilters(cmd)) {
      this.logger.warn({ cmd }, 'dropped command due to filters');
      return;
    }

    await this.storage.getRepository(Command).save(cmd);

    for (const h of this.handlers) {
      if (await h.check(cmd)) {
        return h.handle(cmd);
      }
    }

    this.logger.warn({ cmd }, 'unhandled command');
  }

  /**
   * Dispatch a message to the appropriate listeners (based on the context).
   */
  public async dispatch(msg: Message) {
    this.logger.debug({ msg }, 'dispatching outgoing message');

    if (!await this.checkFilters(msg)) {
      this.logger.warn({ msg }, 'dropped outgoing message due to filters');
      return;
    }

    await this.storage.getRepository(Message).save(msg);

    let emitted = false;
    for (const listener of this.listeners) {
      if (await listener.check(msg.context)) {
        await listener.emit(msg);
        emitted = true;
      }
    }

    if (!emitted) {
      this.logger.warn({ msg }, 'outgoing message was not matched by any listener (dead letter)');
    }
  }

  /**
   * Add a message to the send queue.
   */
  public async send(msg: Message): Promise<void> {
    this.outgoing.next(msg);
  }

  protected async checkFilters(next: FilterValue): Promise<boolean> {
    if (this.filters.length === 0) {
      return true;
    }

    const results = await Promise.all(this.filters.map(async (filter) => {
      const result = await filter.filter(next);
      this.logger.debug({ result }, 'checked filter');
      return result;
    }));

    if (this.strict) {
      return results.every((r) => r === FilterBehavior.Allow);
    } else {
      return results.some((r) => r === FilterBehavior.Allow);
    }
  }

  protected async looseError(err: Error) {
    this.logger.error(err, 'bot stream did not handle error');
  }

  /**
   * These are all created the same way, so they should probably have a common base...
   */
  protected async createPart<T extends Service>(type: string, config: any): Promise<T> {
    return this.container.create<T, any>(type, {
      bot: this,
      config,
      logger: this.logger.child({
        class: type
      })
    });
  }
}

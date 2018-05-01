import * as bunyan from 'bunyan';
import { CronJob } from 'cron';
import { kebabCase } from 'lodash';
import { Container, Inject, Module, Provides } from 'noicejs';
import { ContainerOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { ModuleOptions } from 'noicejs/Module';
import { Observable, Subject } from 'rxjs';
import { Command, CommandOptions } from 'src/Command';
import { Context } from 'src/Context';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { UserFilter, UserFilterConfig } from 'src/filter/UserFilter';
import { EchoHandler, EchoHandlerConfig } from 'src/handler/EchoHandler';
import { Handler } from 'src/handler/Handler';
import { TimeHandler, TimeHandlerConfig } from 'src/handler/TimeHandler';
import { WeatherHandler } from 'src/handler/WeatherHandler';
import { DiscordListener } from 'src/listener/DiscordListener';
import { Listener } from 'src/listener/Listener';
import { SOListener } from 'src/listener/SOListener';
import { Message } from 'src/Message';
import { LexParser, LexParserConfig } from 'src/parser/LexParser';
import { Parser } from 'src/parser/Parser';
import { YamlParser, YamlParserConfig } from 'src/parser/YamlParser';
import { Cooldown } from 'src/util/Cooldown';
import { TemplateCompiler } from 'src/util/TemplateCompiler';

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
    this.bind(kebabCase(TimeHandler.name)).toConstructor(TimeHandler);
    this.bind(kebabCase(EchoHandler.name)).toConstructor(EchoHandler);
    this.bind(kebabCase(WeatherHandler.name)).toConstructor(WeatherHandler);

    // listeners
    this.bind(kebabCase(DiscordListener.name)).toConstructor(DiscordListener);

    // parsers
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
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
}

@Inject('logger')
export class Bot {
  protected config: BotConfig;
  protected commands: Subject<Command>;
  protected container: Container;
  protected logger: Logger;
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

  /**
   * Set up the async resources that cannot be created in the constructor: filters, handlers, parsers, etc
   */
  public async start() {
    this.logger.info('setting up streams');
    this.commands.subscribe((next) => this.handle(next).catch((err) => this.looseError(err)));
    this.incoming.subscribe((next) => this.receive(next).catch((err) => this.looseError(err)));
    this.outgoing.subscribe((next) => this.dispatch(next).catch((err) => this.looseError(err)));

    this.logger.info('setting up filters');
    for (const filterData of this.config.filters) {
      const { type, ...config } = filterData;
      this.logger.debug({ type }, 'configuring filter');
      const filter = await this.createPart<Filter>(type, config);
      this.filters.push(filter);
    }

    this.logger.info('setting up handlers');
    for (const handlerData of this.config.handlers) {
      const { type, ...config } = handlerData;
      this.logger.debug({ type }, 'configuring handler');
      const handler = await this.createPart<Handler>(type, config);
      this.handlers.push(handler);
    }

    this.logger.info('setting up intervals');
    for (const intervalData of this.config.intervals) {
      this.logger.debug({ interval: intervalData }, 'configuring interval');
      const cron = new CronJob(intervalData.cron, async () => {
        for (const data of intervalData.data) {
          const cmd = new Command(data);
          this.commands.next(cmd);
        }
      });
      this.timers.add(cron);
    }

    this.logger.info('setting up listeners');
    for (const listenerData of this.config.listeners) {
      const { type, ...config } = listenerData;
      this.logger.debug({ type }, 'configuring listener');
      const listener = await this.createPart<Listener>(type, config);
      this.listeners.push(listener);
    }

    this.logger.info('setting up parsers');
    for (const parserData of this.config.parsers) {
      const { type, ...config } = parserData;
      this.logger.debug({ type }, 'configuring parser');
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
    for (const p of this.parsers) {
      try {
        if (await p.match(msg)) {
          matched = true;
          const cmds = await p.parse(msg);
          for (const c of cmds) {
            this.commands.next(c);
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
   * Handle a command using the appropriate handler.
   */
  public async handle(cmd: Command) {
    this.logger.debug({ cmd }, 'handling command');

    if (!await this.checkFilters(cmd)) {
      this.logger.warn({ cmd }, 'dropped command due to filters');
      return;
    }

    let handled = false;
    for (const h of this.handlers) {
      if (await h.handle(cmd)) {
        handled = true;
        break;
      }
    }

    if (!handled) {
      this.logger.warn({ cmd }, 'unhandled command');
    }
  }

  /**
   * Dispatch a message to the appropriate listeners (based on the destination).
   */
  public async dispatch(msg: Message) {
    this.logger.debug({ msg }, 'dispatching outgoing message');

    if (!await this.checkFilters(msg)) {
      this.logger.warn({ msg }, 'dropped outgoing message due to filters');
      return;
    }

    for (const l of this.listeners) {
      // @todo: select the correct listener
      l.emit(msg);
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
      this.logger.debug({ filter, result }, 'checked filter');
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
  protected async createPart<T>(type: string, config: any): Promise<T> {
    return this.container.create<T, any>(type, {
      bot: this,
      config,
      logger: this.logger.child({
        class: type
      })
    });
  }
}

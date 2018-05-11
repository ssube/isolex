import { CronJob } from 'cron';
import { Container, Inject, Module, Provides } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Subject } from 'rxjs';
import { Command, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Trigger } from 'src/entity/Trigger';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Handler, HandlerConfig } from 'src/handler/Handler';
import { ContextFetchOptions, Listener } from 'src/listener/Listener';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { Service, ServiceConfig } from 'src/Service';
import { Cooldown } from 'src/utils/Cooldown';
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

export interface BotService {
  type: string;
  [other: string]: string;
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
    for (const data of this.config.filters) {
      const filter = await this.createPart<Filter, ServiceConfig>(data);
      this.filters.push(filter);
    }

    this.logger.info('setting up handlers');
    for (const data of this.config.handlers) {
      const handler = await this.createPart<Handler, HandlerConfig>(data);
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
    for (const data of this.config.listeners) {
      const listener = await this.createPart<Listener, ServiceConfig>(data);
      this.listeners.push(listener);
    }

    this.logger.info('setting up parsers');
    for (const data of this.config.parsers) {
      const parser = await this.createPart<Parser, ParserConfig>(data);
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
    const listener = this.listeners.find((it) => it.id === options.listenerId);
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
  protected async createPart<TService extends Service, TConfig extends ServiceConfig>(data: TConfig & BotService): Promise<TService> {
    const { type, ...config } = data as BotService; // narrow this back to the object half of the union (generic unions cannot be spread)
    this.logger.debug({ data, type }, 'configuring service');

    return this.container.create<TService, any>(type, {
      bot: this,
      config,
      logger: this.logger.child({
        class: type
      })
    });
  }
}

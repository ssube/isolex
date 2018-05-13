import { bindAll } from 'lodash';
import { Container, Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Subject } from 'rxjs';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { Filter, FilterBehavior, FilterValue } from 'src/filter/Filter';
import { Handler, HandlerConfig } from 'src/handler/Handler';
import { ContextFetchOptions, Listener } from 'src/listener/Listener';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { Service, ServiceConfig } from 'src/Service';
import { StorageLogger, StorageLoggerOptions } from 'src/utils/StorageLogger';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';

export interface BotConfig {
  filters: Array<BotService>;
  handlers: Array<BotService & HandlerConfig>;
  listeners: Array<BotService>;
  logger: {
    name: string;
    [other: string]: string;
  };
  parsers: Array<BotService & ParserConfig>;
  storage: ConnectionOptions;
}

export interface BotOptions {
  config: BotConfig;
  container: Container;
  logger: Logger;
}

export interface BotService extends ServiceConfig {
  type: string;
  [other: string]: string;
}

@Inject('logger')
export class Bot {
  protected config: BotConfig;
  protected container: Container;
  protected logger: Logger;
  protected storage: Connection;
  protected strict: boolean;

  // services
  protected filters: Array<Filter>;
  protected handlers: Array<Handler>;
  protected listeners: Array<Listener>;
  protected parsers: Array<Parser>;

  // observables
  protected commands: Subject<Command>;
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

    bindAll(this, 'looseError');
  }

  public getStorage(): Connection {
    return this.storage;
  }

  /**
   * Set up the async resources that cannot be created in the constructor: filters, handlers, parsers, etc
   */
  public async start() {
    this.logger.info('setting up streams');
    /* tslint:disable:no-unbound-method */
    this.commands.subscribe((next) => this.handle(next).catch(this.looseError));
    this.incoming.subscribe((next) => this.receive(next).catch(this.looseError));
    this.outgoing.subscribe((next) => this.dispatch(next).catch(this.looseError));
    /* tslint:enable */

    this.logger.info('connecting to storage');
    const storageLogger = await this.container.create<StorageLogger, StorageLoggerOptions>(StorageLogger, {
      logger: this.logger
    });
    const entities = await this.container.create<Array<Function>, any>('entities');
    this.storage = await createConnection({
      ...this.config.storage,
      entities,
      logger: storageLogger
    });

    this.logger.info('setting up filters');
    for (const data of this.config.filters) {
      this.filters.push(await this.createPart<Filter, ServiceConfig>(data));
    }

    this.logger.info('setting up handlers');
    for (const data of this.config.handlers) {
      this.handlers.push(await this.createPart<Handler, HandlerConfig>(data));
    }

    this.logger.info('setting up listeners');
    for (const data of this.config.listeners) {
      this.listeners.push(await this.createPart<Listener, ServiceConfig>(data));
    }

    this.logger.info('setting up parsers');
    for (const data of this.config.parsers) {
      this.parsers.push(await this.createPart<Parser, ParserConfig>(data));
    }

    this.logger.info('starting listeners');
    for (const listener of this.listeners) {
      await listener.start();
    }

    this.logger.info('bot is ready');
  }

  public async stop() {
    this.logger.debug('stopping streams');
    this.commands.complete();
    this.incoming.complete();
    this.outgoing.complete();

    this.logger.info('bot has stopped');
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

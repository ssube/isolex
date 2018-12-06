import { bindAll } from 'lodash';
import { BaseError, Container, Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger, LogLevel } from 'noicejs/logger/Logger';
import { collectDefaultMetrics, Counter, Registry } from 'prom-client';
import { Subject } from 'rxjs';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';

import { Controller, ControllerData } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { NotFoundError } from 'src/error/NotFoundError';
import { checkFilter, Filter, FilterValue } from 'src/filter/Filter';
import { ContextFetchOptions, Listener } from 'src/listener/Listener';
import { Parser, ParserData } from 'src/parser/Parser';
import { Service, ServiceDefinition } from 'src/Service';
import { filterNil, mustFind } from 'src/utils';
import { mustGet } from 'src/utils/Map';
import { StorageLogger, StorageLoggerOptions } from 'src/utils/StorageLogger';

import { BaseService } from './BaseService';

export interface BotData {
  filters: Array<ServiceDefinition>;
  controllers: Array<ServiceDefinition<ControllerData>>;
  listeners: Array<ServiceDefinition>;
  logger: {
    level: LogLevel;
    name: string;
  };
  migrate: boolean;
  parsers: Array<ServiceDefinition<ParserData>>;
  storage: ConnectionOptions;
  strict: boolean;
}

export type BotDefinition = ServiceDefinition<BotData>;

export type BotOptions = BaseOptions & BotDefinition & {
  logger: Logger;
};

@Inject('logger')
export class Bot extends BaseService<BotData> implements Service {
  public readonly strict: boolean;

  protected readonly container: Container;
  protected collector: number;
  protected metrics: Registry;
  protected storage: Connection;

  // counters
  protected cmdCounter: Counter;
  protected msgCounter: Counter;

  // services
  protected filters: Array<Filter>;
  protected controllers: Array<Controller>;
  protected listeners: Array<Listener>;
  protected parsers: Array<Parser>;
  protected services: Map<string, Service>;

  // observables
  protected commands: Subject<Command>;
  protected incoming: Subject<Message>;
  protected outgoing: Subject<Message>;

  constructor(options: BotOptions) {
    super(options);

    this.container = options.container;
    this.logger.info(options, 'starting bot');

    this.strict = options.data.strict;

    // set up deps
    this.filters = [];
    this.controllers = [];
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
   * Set up the async resources that cannot be created in the constructor: filters, controllers, parsers, etc
   */
  public async start() {
    this.logger.info('setting up streams');
    /* tslint:disable:no-unbound-method */
    this.commands.subscribe((next) => this.receiveCommand(next).catch(this.looseError));
    this.incoming.subscribe((next) => this.receive(next).catch(this.looseError));
    this.outgoing.subscribe((next) => this.receiveMessage(next).catch(this.looseError));
    /* tslint:enable */

    this.logger.info('setting up metrics');
    this.metrics = new Registry();
    this.collector = collectDefaultMetrics({
      register: this.metrics,
      timeout: 5000,
    });

    this.cmdCounter = new Counter({
      help: 'commands received by the bot',
      labelNames: ['service_id', 'service_kind', 'service_name'],
      name: 'bot_command',
      registers: [this.metrics],
    });

    this.msgCounter = new Counter({
      help: 'messages received by the bot',
      labelNames: ['service_id', 'service_kind', 'service_name'],
      name: 'bot_message',
      registers: [this.metrics],
    });

    this.logger.info('connecting to storage');
    const storageLogger = await this.container.create<StorageLogger, StorageLoggerOptions>(StorageLogger, {
      logger: this.logger,
    });
    const entities = await this.container.create<Array<Function>, any>('entities');
    const migrations = await this.container.create<Array<Function>, any>('migrations');

    this.storage = await createConnection({
      ...this.data.storage,
      entities,
      logger: storageLogger,
      migrations,
    });

    if (this.data.migrate) {
      this.logger.info('running pending database migrations');
      await this.storage.runMigrations();
      this.logger.info('database migrations complete');
    }

    this.services = new Map();
    await this.startServices();

    this.logger.info('bot started');
  }

  public async startServices() {
    if (this.services.size) {
      throw new BaseError('unable to start services with existing services');
    }

    this.logger.info('setting up filters');
    for (const data of this.data.filters) {
      this.filters.push(await this.createService<Filter, {}>(data));
    }

    this.logger.info('setting up controllers');
    for (const data of this.data.controllers) {
      this.controllers.push(await this.createService<Controller, ControllerData>(data));
    }

    this.logger.info('setting up listeners');
    for (const data of this.data.listeners) {
      this.listeners.push(await this.createService<Listener, {}>(data));
    }

    this.logger.info('setting up parsers');
    for (const data of this.data.parsers) {
      this.parsers.push(await this.createService<Parser, ParserData>(data));
    }

    this.logger.info('starting services');
    for (const svc of this.services.values()) {
      await svc.start();
    }

    this.logger.info('services started');
  }

  public async stop() {
    this.logger.debug('stopping streams');
    this.commands.complete();
    this.incoming.complete();
    this.outgoing.complete();

    this.logger.debug('stopping services');
    for (const svc of this.services.values()) {
      await svc.stop();
    }
    this.services.clear();

    this.logger.debug('stopping metrics');
    clearInterval(this.collector);

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
    const listener = mustFind(this.listeners, (it) => it.id === options.listenerId);
    const messages = await listener.fetch(options);
    if (!options.useFilters) {
      return messages;
    }

    const filtered: Array<Message> = [];
    for (const message of messages) {
      if (await this.checkFilters(message)) {
        filtered.push(message);
      }
    }

    return filtered;
  }

  /**
   * Add a message to the send queue.
   */
  public async sendMessage(...messages: Array<Message>): Promise<Array<Message>> {
    const results = [];
    for (const data of messages) {
      const msg = await this.storage.getRepository(Message).save(data);
      this.outgoing.next(msg);
      results.push(msg);
    }
    return filterNil(results);
  }

  public async emitCommand(...commands: Array<Command>): Promise<Array<Command>> {
    const results = [];
    for (const data of commands) {
      const cmd = await this.storage.getRepository(Command).save(data);
      this.commands.next(cmd);
      results.push(cmd);
    }
    return filterNil(results);
  }

  /**
   * These are all created the same way, so they should probably have a common base...
   */
  public async createService<TService extends Service, TData>(conf: ServiceDefinition<TData>): Promise<TService> {
    const { metadata: { kind, name } } = conf;
    const tag = `${kind}:${name}`;

    if (this.services.has(tag)) {
      this.logger.info({ kind, tag }, 'fetching existing service');
      return mustGet(this.services, tag) as TService;
    }

    this.logger.info({ kind, tag }, 'creating unknown service');
    const svc = await this.container.create<TService, any>(kind, {
      ...conf,
      bot: this,
      logger: this.logger.child({
        kind,
      }),
    });

    this.logger.debug({ id: svc.id, kind, tag }, 'service created');
    this.services.set(tag, svc);

    return svc;
  }

  public getMetrics(): Registry {
    return this.metrics;
  }

  public getService<TService extends Service>(id: string): TService {
    for (const svc of this.services.values()) {
      if (svc.id === id) {
        return svc as TService;
      }
    }

    throw new NotFoundError(`service ${id} not found`);
  }

  public listServices() {
    this.logger.debug('listing services');
    return this.services;
  }

  /**
   * Handle a command using the appropriate controller.
   */
  protected async receiveCommand(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'handling command');
    this.cmdCounter.labels(this.id, this.kind, this.name).inc();

    if (!await this.checkFilters(cmd)) {
      this.logger.warn({ cmd }, 'dropped command due to filters');
      return;
    }

    for (const h of this.controllers) {
      if (await h.check(cmd)) {
        await h.handle(cmd);
        return;
      }
    }

    this.logger.warn({ cmd }, 'unhandled command');
  }

  /**
   * Dispatch a message to the appropriate listeners (based on the context).
   */
  protected async receiveMessage(msg: Message): Promise<void> {
    this.logger.debug({ msg }, 'dispatching outgoing message');
    this.msgCounter.labels(this.id, this.kind, this.name).inc();

    if (!await this.checkFilters(msg)) {
      this.logger.warn({ msg }, 'dropped outgoing message due to filters');
      return;
    }

    let emitted = false;
    for (const listener of this.listeners) {
      if (await listener.check(msg.context)) {
        await listener.send(msg);
        emitted = true;
      }
    }

    if (!emitted) {
      this.logger.warn({ msg }, 'outgoing message was not matched by any listener (dead letter)');
    }
  }

  protected async checkFilters(next: FilterValue): Promise<boolean> {
    for (const filter of this.filters) {
      const result = await filter.check(next);
      this.logger.debug({ result }, 'checked filter');

      if (!checkFilter(result, this.strict)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Log an otherwise-unhandled but non-fatal error (typically leaked from one of the observables).
   *
   * Note: this method is already bound, so it can be passed with `this.looseError`. Using that requires
   * `tslint:disable:no-unbound-method` as well.
   */
  protected async looseError(err: Error) {
    this.logger.error(err, 'bot stream did not handle error');
  }
}

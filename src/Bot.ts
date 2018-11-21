import { bindAll } from 'lodash';
import { BaseError, Container, Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { Logger } from 'noicejs/logger/Logger';
import { Subject } from 'rxjs';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import * as uuid from 'uuid/v4';

import { Controller, ControllerData } from 'src/controller/Controller';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { checkFilter, Filter, FilterValue } from 'src/filter/Filter';
import { ContextFetchOptions, Listener } from 'src/listener/Listener';
import { Parser, ParserData } from 'src/parser/Parser';
import { Service, ServiceDefinition } from 'src/Service';
import { StorageLogger, StorageLoggerOptions } from 'src/utils/StorageLogger';

import { InvalidArgumentError } from './error/InvalidArgumentError';
import { mustGet } from './utils';

export interface BotData {
  filters: Array<ServiceDefinition>;
  controllers: Array<ServiceDefinition<ControllerData>>;
  listeners: Array<ServiceDefinition>;
  logger: {
    name: string;
    [other: string]: string;
  };
  migrate: boolean;
  parsers: Array<ServiceDefinition<ParserData>>;
  storage: ConnectionOptions;
}

export type BotDefinition = ServiceDefinition<BotData>;

export type BotOptions = BaseOptions & BotDefinition & {
  logger: Logger;
};

@Inject('logger')
export class Bot implements Service {
  public readonly id: string;
  public readonly kind: string;
  public readonly name: string;

  protected readonly container: Container;
  protected readonly data: Readonly<BotData>;
  protected readonly logger: Logger;
  protected storage: Connection;
  protected strict: boolean;

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
    this.id = uuid();
    this.kind = options.metadata.kind;
    this.name = options.metadata.name;

    this.container = options.container;
    this.data = options.data;
    this.logger = options.logger.child({
      class: Bot.name,
    });
    this.logger.info(options, 'starting bot');

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
    this.commands.subscribe((next) => this.handle(next).catch(this.looseError));
    this.incoming.subscribe((next) => this.receive(next).catch(this.looseError));
    this.outgoing.subscribe((next) => this.dispatch(next).catch(this.looseError));
    /* tslint:enable */

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
   * Handle a command using the appropriate controller.
   */
  public async handle(cmd: Command) {
    this.logger.debug({ cmd }, 'handling command');

    if (!await this.checkFilters(cmd)) {
      this.logger.warn({ cmd }, 'dropped command due to filters');
      return;
    }

    await this.storage.getRepository(Command).save(cmd);

    for (const h of this.controllers) {
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
  public async send(...messages: Array<Message>): Promise<void> {
    for (const msg of messages) {
      if (!Message.isMessage(msg)) {
        throw new InvalidArgumentError('sent message must be an instance of message entity');
      }
      this.outgoing.next(msg);
    }
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

    this.logger.debug({ id: svc.id, kind, tag  }, 'service created');
    this.services.set(tag, svc);

    return svc;
  }

  protected async checkFilters(next: FilterValue): Promise<boolean> {
    for (const filter of this.filters) {
      const result = await filter.filter(next);
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

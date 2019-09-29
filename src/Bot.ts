import { isNil } from 'lodash';
import { Container, Inject, LogLevel } from 'noicejs';
import { Counter, Registry } from 'prom-client';
import { Subject } from 'rxjs';

import {
  BaseService,
  BaseServiceData,
  BaseServiceOptions,
  INJECT_LOGGER,
  INJECT_METRICS,
  INJECT_SERVICES,
} from './BaseService';
import { Controller, ControllerData } from './controller';
import { Endpoint, EndpointData } from './endpoint';
import { Command } from './entity/Command';
import { Message } from './entity/Message';
import { Interval, IntervalData } from './interval';
import { ContextFetchOptions, Listener, ListenerData } from './listener';
import { Locale, LocaleData } from './locale';
import { ServiceModule } from './module/ServiceModule';
import { Parser, ParserData } from './parser';
import { Service, ServiceDefinition, ServiceEvent } from './Service';
import { Storage, StorageData } from './storage';
import { filterNil, mustExist, mustFind } from './utils';
import { ExternalModule } from './utils/ExternalModule';
import { createServiceCounter, incrementServiceCounter } from './utils/metrics';

export interface BotData extends BaseServiceData {
  controllers: Array<ServiceDefinition<ControllerData>>;
  endpoints: Array<ServiceDefinition<EndpointData>>;
  intervals: Array<ServiceDefinition<IntervalData>>;
  listeners: Array<ServiceDefinition<ListenerData>>;
  locale: ServiceDefinition<LocaleData>;
  logger: {
    level: LogLevel;
    name: string;
  };
  modules: Array<ExternalModule>;
  parsers: Array<ServiceDefinition<ParserData>>;
  process: {
    pid: {
      file: string;
    };
  };
  services: {
    timeout: number;
  };
  storage: ServiceDefinition<StorageData>;
}

export type BotDefinition = ServiceDefinition<BotData>;

@Inject(INJECT_LOGGER, INJECT_METRICS, INJECT_SERVICES)
export class Bot extends BaseService<BotData> implements Service {
  protected readonly container: Container;
  protected readonly metrics: Registry;

  protected locale?: Locale;
  protected storage?: Storage;

  // counters
  protected cmdCounter?: Counter;
  protected msgCounter?: Counter;

  // services
  protected controllers: Array<Controller>;
  protected endpoints: Array<Endpoint>;
  protected intervals: Array<Interval>;
  protected listeners: Array<Listener>;
  protected parsers: Array<Parser>;
  protected services: ServiceModule;

  // observables
  protected commands: Subject<Command>;
  protected incoming: Subject<Message>;
  protected outgoing: Subject<Message>;

  constructor(options: BaseServiceOptions<BotData>) {
    super(options, 'isolex#/definitions/service-bot');

    this.logger.info(options, 'creating bot');

    this.container = options.container;
    this.metrics = mustExist(options[INJECT_METRICS]);
    this.services = mustExist(options[INJECT_SERVICES]);

    // set up deps
    this.controllers = [];
    this.endpoints = [];
    this.intervals = [];
    this.listeners = [];
    this.parsers = [];

    // set up streams
    this.commands = new Subject();
    this.incoming = new Subject();
    this.outgoing = new Subject();

    this.startMetrics();
  }

  public getLocale(): Locale {
    return mustExist(this.locale);
  }

  public getStorage(): Storage {
    return mustExist(this.storage);
  }

  public async notify(event: ServiceEvent) {
    await super.notify(event);
    await this.services.notify(event);

    switch (event) {
      case ServiceEvent.Reset:
        this.metrics.resetMetrics();
        this.logger.info('metrics reset');
        break;
      default:
        this.logger.debug({ event }, 'ignoring notification');
    }
  }

  /**
   * Set up the async resources that cannot be created in the constructor: filters, controllers, parsers, etc
   */
  public async start() {
    this.logger.info('starting bot');

    const streamError = (err: Error) => {
      this.logger.error(err, 'bot stream did not handle error');
    };
    this.commands.subscribe((next) => this.receiveCommand(next).catch(streamError));
    this.incoming.subscribe((next) => this.receive(next).catch(streamError));
    this.outgoing.subscribe((next) => this.receiveMessage(next).catch(streamError));

    await this.startServices();

    this.logger.info('bot started');
  }

  public async stop() {
    this.logger.debug('stopping streams');
    this.commands.complete();
    this.incoming.complete();
    this.outgoing.complete();

    this.logger.debug('stopping services');
    await this.services.stop();

    this.logger.debug('stopping storage');
    await this.getStorage().stop();

    this.logger.info('bot has stopped');
  }

  /**
   * Receive an incoming message and turn it into commands.
   */
  public async receive(msg: Message): Promise<Array<Command>> {
    this.logger.debug({ msg }, 'received incoming message');

    const commands = await this.parseMessage(msg);
    if (commands.length === 0) {
      this.logger.debug({ msg }, 'incoming message did not produce any commands');
    }

    return this.executeCommand(...commands);
  }

  /**
   * Fetches messages using a specified listener.
   */
  public async fetch(options: ContextFetchOptions) {
    const listener = mustFind(this.listeners, (it) => it.id === options.listenerId);
    return listener.fetch(options);
  }

  /**
   * Add a message to the send queue.
   */
  public async sendMessage(...messages: Array<Message>): Promise<Array<Message>> {
    const storage = mustExist(this.storage);
    const results = [];
    for (const data of messages) {
      const msg = await storage.getRepository(Message).save(data);
      this.logger.debug({ msg }, 'message saved');
      this.outgoing.next(msg);
      results.push(msg);
    }
    return filterNil(results);
  }

  public async executeCommand(...commands: Array<Command>): Promise<Array<Command>> {
    const storage = mustExist(this.storage);
    const results = [];
    for (const data of commands) {
      const cmd = await storage.getRepository(Command).save(data);
      this.commands.next(cmd);
      results.push(cmd);
    }
    return filterNil(results);
  }

  /**
   * Handle a command using the appropriate controller.
   */
  protected async receiveCommand(cmd: Command): Promise<void> {
    this.logger.debug({ cmd }, 'receiving command');
    incrementServiceCounter(this, mustExist(this.cmdCounter), {
      commandNoun: cmd.noun,
      commandVerb: cmd.verb,
    });

    for (const h of this.controllers) {
      if (await h.check(cmd)) {
        await h.handle(cmd);
        return;
      }
    }

    this.logger.warn({ cmd }, 'unhandled command');
  }

  /**
   * Dispatch a message to the appropriate listener (based on the context).
   */
  protected async receiveMessage(msg: Message): Promise<void> {
    this.logger.debug({ msg }, 'receiving outgoing message');
    incrementServiceCounter(this, mustExist(this.msgCounter), {
      messageType: msg.type,
    });

    const context = mustExist(msg.context);
    if (isNil(context.target)) {
      return this.findMessageTarget(msg);
    } else {
      return this.sendMessageTarget(msg, context.target);
    }
  }

  protected async findMessageTarget(msg: Message): Promise<void> {
    for (const target of this.listeners) {
      if (await target.check(msg)) {
        await target.send(msg);
        return;
      }
    }

    this.logger.warn({ msg }, 'message was rejected by every listener (dead letter)');
  }

  protected async sendMessageTarget(msg: Message, target: Listener): Promise<void> {
    if (await target.check(msg)) {
      await target.send(msg);
    } else {
      this.logger.warn({ msg }, 'target listener rejected message');
    }
  }

  protected async parseMessage(msg: Message) {
    const commands: Array<Command> = [];
    let matched = false;
    for (const parser of this.parsers) {
      try {
        if (await parser.match(msg)) {
          matched = true;
          this.logger.debug({ msg, parser: parser.name }, 'parsing message');
          commands.push(...await parser.parse(msg));
        }
      } catch (err) {
        this.logger.error(err, 'error running parser');
      }
    }

    if (!matched) {
      this.logger.debug({ msg }, 'incoming message was not matched by any parsers');
    }

    return commands;
  }

  protected startMetrics() {
    this.logger.info('setting up metrics');

    this.cmdCounter = createServiceCounter(this.metrics, {
      help: 'commands received by the bot',
      labelNames: ['commandNoun', 'commandVerb'],
      name: 'bot_command',
    });

    this.msgCounter = createServiceCounter(this.metrics, {
      help: 'messages received by the bot',
      labelNames: ['messageType'],
      name: 'bot_message',
    });
  }

  protected async startServices() {
    this.logger.info('starting localization');
    this.locale = await this.container.create(Locale, this.data.locale);
    await this.locale.start();

    this.logger.info('starting storage');
    this.storage = await this.container.create(Storage, this.data.storage);
    await this.storage.start();

    this.logger.info('setting up controllers');
    for (const data of this.data.controllers) {
      this.controllers.push(await this.services.createService<Controller, ControllerData>(data));
    }

    this.logger.info('setting up endpoints');
    for (const data of this.data.endpoints) {
      this.endpoints.push(await this.services.createService<Endpoint, EndpointData>(data));
    }

    this.logger.info('setting up intervals');
    for (const data of this.data.intervals) {
      this.intervals.push(await this.services.createService<Interval, IntervalData>(data));
    }

    this.logger.info('setting up listeners');
    for (const data of this.data.listeners) {
      this.listeners.push(await this.services.createService<Listener, ListenerData>(data));
    }

    this.logger.info('setting up parsers');
    for (const data of this.data.parsers) {
      this.parsers.push(await this.services.createService<Parser, ParserData>(data));
    }

    this.logger.info('starting services');
    await this.services.start();

    this.logger.info('services started');
  }
}

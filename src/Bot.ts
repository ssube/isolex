import * as bunyan from 'bunyan';
import { CronJob } from 'cron';
import { kebabCase } from 'lodash';
import { Container, Module, Inject } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Observable, Subject } from 'rxjs';
import { Command, CommandOptions } from 'src/Command';
import { Destination } from 'src/Destination';
import { Filter, FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterConfig } from 'src/filter/UserFilter';
import { EchoHandler, EchoHandlerConfig } from 'src/handler/EchoHandler';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { LexParser, LexParserConfig } from 'src/parser/LexParser';
import { Parser } from 'src/parser/Parser';
import { YamlParser, YamlParserConfig } from 'src/parser/YamlParser';
import { Cooldown } from 'src/util/Cooldown';
import { TemplateCompiler } from 'src/util/TemplateCompiler';
import { isEventMessage } from 'src/utils';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessagePosted } from 'vendor/so-client/src/events';
import { TimeHandler, TimeHandlerConfig } from './handler/TimeHandler';

export interface BotConfig {
  filters: Array<any>;
  handlers: Array<any>;
  intervals: Array<{
    cron: string;
    data: Array<CommandOptions>;
  }>;
  logger: {
    name: string;
    [other: string]: string;
  };
  parsers: Array<any>;
  stack: {
    account: {
      email: string;
      password: string;
    };
    rate: {
      base: number;
      grow: number;
    }
    rooms: Array<number>;
  };
}

export interface BotOptions {
  config: BotConfig;
  container: Container;
  logger: Logger;
}

export class BotModule extends Module {
  public async configure() {
    this.bind(TemplateCompiler).toConstructor(TemplateCompiler);
    this.bind(kebabCase(UserFilter.name)).toConstructor(UserFilter);
    this.bind(kebabCase(TimeHandler.name)).toConstructor(TimeHandler);
    this.bind(kebabCase(EchoHandler.name)).toConstructor(EchoHandler);
    this.bind(kebabCase(LexParser.name)).toConstructor(LexParser);
    this.bind(kebabCase(YamlParser.name)).toConstructor(YamlParser);
    this.bind('logger').toFactory(this.createLogger);
  }

  protected async createLogger(options: bunyan.LoggerOptions): Promise<Logger> {
    return bunyan.createLogger(options);
  }
}

@Inject('logger')
export class Bot {
  protected client: Client;
  protected config: BotConfig;
  protected commands: Subject<Command>;
  protected container: Container;
  protected filters: Array<Filter>;
  protected handlers: Array<Handler>;
  protected logger: Logger;
  protected messages: Subject<Event>;
  protected outgoing: Subject<Message>;
  protected parsers: Array<Parser>;
  protected rate: Cooldown;
  protected room: number;
  protected strict: boolean;
  protected timers: Set<CronJob>;

  constructor(options: BotOptions) {
    this.config = options.config;
    this.container = options.container;
    this.logger = options.logger.child(options.config.logger);
    this.logger.info(options, 'starting bot');

    // set up deps
    this.filters = [];
    this.handlers = [];
    this.parsers = [];

    // set up streams
    this.commands = new Subject();
    this.messages = new Subject();
    this.outgoing = new Subject();

    // set up crons
    this.timers = new Set();

    // set up SO client
    const clientOptions = {
      email: options.config.stack.account.email,
      mainRoom: options.config.stack.rooms[0],
      password: options.config.stack.account.password
    };
    this.logger.info(clientOptions, 'creating SO client');
    this.client = new Client(clientOptions);
  }

  /**
   * Set up the async resources that cannot be created in the constructor: filters, handlers, parsers, etc
   */
  public async start() {
    this.logger.info('setting up streams');
    // base streams
    this.commands.subscribe((next) => this.handle(next).catch((err) => this.looseError(err)));
    this.messages.subscribe((next) => this.receive(next).catch((err) => this.looseError(err)));

    this.rate = new Cooldown(this.config.stack.rate);
    Observable.zip(this.outgoing, this.rate.getStream()).subscribe((next: [Message, number]) => {
      this.dispatch(next[0]).catch((err) => this.looseError(err));
    });

    for (const filterData of this.config.filters) {
      const { type, ...config } = filterData;
      this.logger.debug({ type }, 'configuring filter');
      const filter = await this.createPart<Filter>(type, config);
      this.filters.push(filter);
    }

    for (const handlerData of this.config.handlers) {
      const { type, ...config } = handlerData;
      this.logger.debug({ type }, 'configuring handler');
      const handler = await this.createPart<Handler>(type, config);
      this.handlers.push(handler);
    }

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

    for (const parserData of this.config.parsers) {
      const { type, ...config } = parserData;
      this.logger.debug({ type }, 'configuring parser');
      const parser = await this.createPart<Parser>(type, config);
      this.parsers.push(parser);
    }

    // connect to chat
    this.logger.info('authenticating with chat');
    await this.client.auth();

    this.logger.info('joining rooms');
    await this.client.join();

    this.client.on('debug', (msg: string) => {
      this.logger.debug(msg);
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(err, 'error from SO client');
    });

    this.client.on('event', async (event: Event) => {
      this.logger.debug({ event }, 'client got event');
      if (isEventMessage(event)) {
        this.messages.next(event);
      }
    });

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
    this.messages.complete();
    this.outgoing.complete();
  }

  public async receive(event: Event) {
    this.logger.debug({ event }, 'received event');

    if (!await this.checkFilters(event)) {
      this.logger.warn({ event }, 'dropped event due to filters');
      return;
    }

    let matched = false;
    for (const p of this.parsers) {
      if (await p.match(event)) {
        matched = true;
        const cmds = await p.parse(event);
        for (const c of cmds) {
          this.commands.next(c);
        }
      }
    }

    if (!matched) {
      this.logger.debug({ event }, 'event was not matched by any parsers');
    }
  }

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

  public async dispatch(msg: Message) {
    this.logger.debug({ msg }, 'dispatching message');

    if (!await this.checkFilters(msg)) {
      this.logger.warn({ msg }, 'dropped message due to filters');
      return;
    }

    try {
      await this.client.send(msg.escaped, this.room);
      this.logger.debug({ msg }, 'dispatched message');
    } catch (err) {
      if (err.message.includes('StatusCodeError: 409')) {
        const rate = this.rate.inc();
        this.logger.warn({ rate }, 'reply was rate-limited');
        setTimeout(() => {
          this.send(msg).catch((err) => this.logger.error(err, 'error resending message'));
        }, rate);
      } else {
        this.logger.error(err, 'reply failed');
      }
    }
  }

  public async send(msg: Message): Promise<void> {
    this.outgoing.next(msg);
  }

  protected async checkFilters(next: Command | Event | Message): Promise<boolean> {
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

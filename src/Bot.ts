import * as bunyan from 'bunyan';
import { Observable, Subject } from 'rxjs';
import { Command } from 'src/command/Command';
import { Destination } from 'src/Destination';
import { Filter, FilterBehavior } from 'src/filter/Filter';
import { UserFilter, UserFilterConfig } from 'src/filter/UserFilter';
import { EchoHandler, EchoHandlerConfig } from 'src/handler/EchoHandler';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { LexParser, LexParserConfig } from 'src/parser/LexParser';
import { Parser } from 'src/parser/Parser';
import { YamlParser, YamlParserConfig } from 'src/parser/YamlParser';
import { isEventMessage } from 'src/utils';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessagePosted } from 'vendor/so-client/src/events';
import { TimeHandler, TimeHandlerConfig } from './handler/TimeHandler';

export interface BotConfig {
  filter: {
    user: UserFilterConfig;
  };
  handler: {
    echo: EchoHandlerConfig;
    time: TimeHandlerConfig;
  };
  log: {
    name: string;
    [other: string]: string;
  };
  parser: {
    lex: LexParserConfig;
    yaml: YamlParserConfig;
  };
  stack: {
    account: {
      email: string;
      password: string;
    };
    delay: {
      next: number;
      rate: number;
    }
    rooms: Array<number>;
  };
}

export interface BotOptions {
  config: BotConfig;
}

export class Bot {
  protected client: Client;
  protected config: BotConfig;
  protected commands: Subject<Command>;
  protected filters: Array<Filter>;
  protected handlers: Array<Handler>;
  protected interval: Observable<number>;
  protected logger: bunyan;
  protected messages: Subject<Event>;
  protected outgoing: Subject<Message>;
  protected parsers: Array<Parser>;
  protected rate: number;
  protected room: number;
  protected strict: boolean;

  constructor(options: BotOptions) {
    this.logger = bunyan.createLogger(options.config.log);
    this.logger.info(options, 'starting bot');

    // set up deps
    this.filters = [new UserFilter({
      bot: this,
      config: options.config.filter.user,
      logger: this.logger
    })];
    this.handlers = [new TimeHandler({
      bot: this,
      config: options.config.handler.time,
      logger: this.logger
    }), new EchoHandler({
      bot: this,
      config: options.config.handler.echo,
      logger: this.logger
    })];
    this.parsers = [new LexParser({
      bot: this,
      config: options.config.parser.lex,
      logger: this.logger
    }), new YamlParser({
      bot: this,
      config: options.config.parser.yaml,
      logger: this.logger
    })];

    // set up streams
    this.commands = new Subject();
    this.interval = Observable.interval(options.config.stack.delay.next);
    this.messages = new Subject();
    this.outgoing = new Subject();

    // set up SO client
    const clientOptions = {
      email: options.config.stack.account.email,
      mainRoom: options.config.stack.rooms[0],
      password: options.config.stack.account.password
    };
    this.logger.info(clientOptions, 'creating SO client');
    this.client = new Client(clientOptions);
  }

  public async start() {
    this.logger.info('setting up streams');
    this.commands.subscribe((next) => this.handle(next).catch((err) => this.looseError(err)));
    this.messages.subscribe((next) => this.receive(next).catch((err) => this.looseError(err)));
    Observable.zip(this.outgoing, this.interval).subscribe((next: [Message, number]) => {
      this.dispatch(next[0]).catch((err) => this.looseError(err));
    });

    this.logger.info('authenticating with chat');
    await this.client.auth();

    this.logger.info('joining rooms');
    await this.client.join();

    this.client.on('event', async (event: Event) => {
      this.logger.debug({event}, 'client got event');
      if (isEventMessage(event)) {
        this.messages.next(event);
      }
    });

    this.logger.info('bot is ready');
  }

  public async stop() {
    this.logger.info('stopping bot');
  }

  public async receive(event: Event) {
    this.logger.debug({event}, 'received event');

    if (!await this.checkFilters(event)) {
      this.logger.warn({event}, 'dropped event due to filters');
      return;
    }

    for (const p of this.parsers) {
      if (await p.match(event)) {
        const cmds = await p.parse(event);
        for (const c of cmds) {
          this.commands.next(c);
        }
      }
    }
  }

  public async handle(cmd: Command) {
    this.logger.debug({cmd}, 'handling command');

    if (!await this.checkFilters(cmd)) {
      this.logger.warn({cmd}, 'dropped command due to filters');
      return;
    }

    for (const h of this.handlers) {
      if (await h.handle(cmd)) {
        break;
      }
    }
  }

  public async dispatch(msg: Message) {
    this.logger.debug({msg}, 'dispatching message');

    if (!await this.checkFilters(msg)) {
      this.logger.warn({msg}, 'dropped message due to filters');
      return;
    }

    try {
      await this.client.send(msg.escaped, this.room);
      this.logger.debug({msg}, 'dispatched message');
    } catch (err) {
      if (err.message.includes('StatusCodeError: 409')) {
        this.logger.warn('reply was rate-limited');
        setTimeout(() => {
          this.send(msg).catch((err) => this.logger.error(err, 'error resending message'));
        }, this.config.stack.delay.rate);
      } else {
        this.logger.error(err, 'reply failed');
      }
    }
  }

  public async send(msg: Message): Promise<void> {
    this.outgoing.next(msg);
  }

  protected async checkFilters(next: Command | Event | Message): Promise<boolean> {
    const results = await Promise.all(this.filters.map(async (filter) => {
      const result = await filter.filter(next);
      this.logger.debug({filter, result}, 'checked filter');
      return result;
    }));

    if (this.strict) {
      return results.every((r) => r === FilterBehavior.Allow);
    } else {
      return results.some((r) => r === FilterBehavior.Allow);
    }
  }

  protected async looseError(err: Error) {

  }
}

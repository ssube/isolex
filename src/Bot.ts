import * as bunyan from 'bunyan';
import { Observable, Subject } from 'rxjs';
import { Command } from 'src/command/Command';
import { Destination } from 'src/Destination';
import { EchoHandler, EchoHandlerConfig } from 'src/handler/EchoHandler';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { LexParser, LexParserConfig } from 'src/parser/LexParser';
import { Parser } from 'src/parser/Parser';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessagePosted } from 'vendor/so-client/src/events';

export interface BotConfig {
  echo: EchoHandlerConfig;
  lex: LexParserConfig;
  log: {
    name: string;
    [other: string]: string;
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
  protected handlers: Array<Handler>;
  protected interval: Observable<number>;
  protected logger: bunyan;
  protected messages: Subject<Event>;
  protected outgoing: Subject<Message>;
  protected parsers: Array<Parser>;
  protected room: number;

  constructor(options: BotOptions) {
    this.logger = bunyan.createLogger(options.config.log);
    this.logger.info(options, 'starting bot');

    // set up deps
    this.handlers = [new EchoHandler({
      bot: this,
      config: options.config.echo,
      logger: this.logger
    })];
    this.parsers = [new LexParser({
      bot: this,
      config: options.config.lex,
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
    this.commands.subscribe((next: Command) => this.handle(next));
    this.messages.subscribe((next: Event) => this.receive(next));
    Observable.zip(this.outgoing, this.interval).subscribe((next: [Message, number]) => {
      this.dispatch(next[0]);
    });

    this.logger.info('authenticating with chat');
    await this.client.auth();

    this.logger.info('joining rooms');
    await this.client.join();

    this.client.on('event', async (event: Event) => {
      this.logger.debug(event, 'client got event');
      if (event.event_type === 1) {
        this.messages.next(event);
      }
    });
    // set up handlers
  }

  public async stop() {
    // shut down
  }

  public async receive(event: Event) {
    this.logger.debug({event}, 'received event');

    for (const p of this.parsers) {
      if (await p.match(event)) {
        const cmd = await p.parse(event);
        this.commands.next(cmd);
      }
    }
  }

  public async handle(cmd: Command) {
    this.logger.debug({cmd}, 'handling command');

    for (const h of this.handlers) {
      if (await h.handle(cmd)) {
        break;
      }
    }
  }

  public async dispatch(msg: Message) {
    this.logger.debug({msg}, 'dispatching message');

    try {
      await this.client.send(msg.body, this.room);
    } catch (err) {
      if (err.message.includes('StatusCodeError: 409')) {
        this.logger.warn('reply was rate-limited, putting back on queue');
        setTimeout(() => {
          this.send(msg);
        }, this.config.stack.delay.rate);
      }
    }
  }

  public async send(msg: Message): Promise<void> {
    this.outgoing.next(msg);
  }
}

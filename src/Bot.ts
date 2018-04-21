import { Observable, Subject } from 'rxjs';
import { Command } from 'src/command/Command';
import { Destination } from 'src/Destination';
import { Handler } from 'src/handler/Handler';
import { Message } from 'src/Message';
import { Parser } from 'src/parser/Parser';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessagePosted } from 'vendor/so-client/src/events';

export interface BotConfig {
  account: {
    email: string;
    password: string;
  };
  rooms: Array<number>;
}

export interface BotOptions {
  config: BotConfig;
}

export class Bot {
  protected client: Client;
  protected commands: Subject<Command>;
  protected handlers: Array<Handler>;
  protected messages: Subject<Event>;
  protected parsers: Array<Parser>;
  protected room: number;

  constructor(options: BotOptions) {
    // set up deps

    // set up streams
    this.commands = new Subject();
    this.messages = new Subject();

    // set up SO client
    this.client = new Client({
      email: options.config.account.email,
      mainRoom: options.config.rooms[0],
      password: options.config.account.password
    });
    this.client.on('event', (msg: Event) => this.receive(msg));
  }

  public async start() {
    await this.client.auth();
    await this.client.join();

    this.client.on('event', async (event: Event) => {
      if (event.event_type === 1) {
        this.receive(event);
      }
    });
    // set up handlers
  }

  public async stop() {
    // shut down
  }

  public async receive(msg: Event) {
    for (const p of this.parsers) {
      if (await p.match(msg)) {
        const cmd = await p.parse(msg);
        this.commands.next(cmd);
      }
    }
  }

  public async handle(cmd: Command) {
    for (const h of this.handlers) {
      if (await h.handle(cmd)) {
        break;
      }
    }
  }

  public async send(dest: Destination, msg: Message): Promise<void> {
    const body = `@${dest.userName}: ${msg.body}`;
    await this.client.send(body, this.room);
  }
}

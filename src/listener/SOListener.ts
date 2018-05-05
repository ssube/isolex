import { Container } from 'noicejs';
import { Logger } from 'noicejs/logger/Logger';
import { Observable, Subject } from 'rxjs';
import { Bot } from 'src/Bot';
import { Context } from 'src/Context';
import { Listener, FetchOptions } from 'src/listener/Listener';
import { Message } from 'src/Message';
import { ServiceOptions } from 'src/Service';
import { Cooldown, CooldownOptions, CooldownConfig } from 'src/util/Cooldown';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessageEdited, MessagePosted } from 'vendor/so-client/src/events';

export interface SOListenerConfig {
  account: {
    email: string;
    password: string;
  };
  rate: CooldownConfig;
  rooms: Array<number>;
}

export type SOListenerOptions = ServiceOptions<SOListenerConfig>;

export class SOListener implements Listener {
  bot: Bot;
  client: Client;
  config: SOListenerConfig;
  container: Container;
  logger: Logger;
  outgoing: Subject<Message>;
  rate: Cooldown;
  room: number;

  public static isEventMessage(event: Event): event is MessagePosted | MessageEdited {
    return (event.event_type === 1 || event.event_type === 2);
  }

  public static getEventContext(event: Event): Context {
    if (!SOListener.isEventMessage(event)) {
      throw new Error('invalid event type');
    }

    return {
      roomId: event.room_id.toString(),
      threadId: event.message_id.toString(),
      userId: event.user_id.toString(),
      userName: event.user_name
    };
  }

  constructor(options: SOListenerOptions) {
    this.config = options.config;
    this.container = options.container;
  }

  async start() {
    this.rate = await this.container.create<Cooldown, CooldownOptions>(Cooldown, { config: this.config.rate });
    Observable.zip(this.outgoing, this.rate.getStream()).subscribe((next: [Message, number]) => {
      this.emit(next[0]).catch((err) => this.logger.error(err));
    });

    const clientOptions = {
      email: this.config.account.email,
      mainRoom: this.config.rooms[0],
      password: this.config.account.password
    };
    this.logger.info(clientOptions, 'creating SO client');
    this.client = new Client(clientOptions);

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
      this.receive(event);
    });
  }

  async stop() {
    this.client.removeAllListeners('debug');
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('event');
  }

  async emit(msg: Message) {
    try {
      await this.client.send(msg.escaped, this.room);
      this.logger.debug({ msg }, 'dispatched message');
    } catch (err) {
      if (err.message.includes('StatusCodeError: 409')) {
        const rate = this.rate.inc();
        this.logger.warn({ rate }, 'reply was rate-limited');
        setTimeout(() => {
          this.emit(msg).catch((err) => this.logger.error(err, 'error resending message'));
        }, rate);
      } else {
        this.logger.error(err, 'reply failed');
      }
    }
  }

  async fetch(options: FetchOptions): Promise<Array<Message>> {
    throw new Error('not implemented');
  }

  async receive(event: Event): Promise<void> {
    this.logger.debug({ event }, 'client got event');
    if (SOListener.isEventMessage(event)) {
      const msg = Message.create({
        body: event.content,
        context: SOListener.getEventContext(event),
        reactions: []
      })
      this.bot.receive(msg);
    }
  }
}

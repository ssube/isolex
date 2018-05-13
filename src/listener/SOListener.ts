import { Container } from 'noicejs';
import { Observable, Subject } from 'rxjs';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { BaseListener } from 'src/listener/BaseListener';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { ServiceConfig, ServiceOptions } from 'src/Service';
import { Cooldown, CooldownConfig, CooldownOptions } from 'src/utils/Cooldown';
import { Client } from 'vendor/so-client/src/client';
import { Event, MessageEdited, MessagePosted } from 'vendor/so-client/src/events';

export interface SOListenerConfig extends ServiceConfig {
  account: {
    email: string;
    password: string;
  };
  rate: CooldownConfig;
  rooms: Array<number>;
}

export type SOListenerOptions = ServiceOptions<SOListenerConfig>;

export class SOListener extends BaseListener<SOListenerConfig> implements Listener {
  public static isEventMessage(event: Event): event is MessagePosted | MessageEdited {
    return (event.event_type === 1 || event.event_type === 2);
  }

  protected client: Client;
  protected container: Container;
  protected outgoing: Subject<Message>;
  protected rate: Cooldown;
  protected room: number;

  constructor(options: SOListenerOptions) {
    super(options);

    this.container = options.container;
  }

  public getEventContext(event: Event): Context {
    if (!SOListener.isEventMessage(event)) {
      throw new Error('invalid event type');
    }

    return Context.create({
      listenerId: this.id,
      roomId: event.room_id.toString(),
      threadId: event.message_id.toString(),
      userId: event.user_id.toString(),
      userName: event.user_name
    });
  }

  public async start() {
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
      this.receive(event).catch((err) => this.logger.error(err, 'error receiving event'));
    });
  }

  public async stop() {
    this.client.removeAllListeners('debug');
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('event');
  }

  public async emit(msg: Message) {
    try {
      await this.client.send(msg.escaped, this.room);
      this.logger.debug({ msg }, 'dispatched message');
    } catch (err) {
      if (err.message.includes('StatusCodeError: 409')) {
        const rate = this.rate.inc();
        this.logger.warn({ rate }, 'reply was rate-limited');
        setTimeout(() => {
          this.emit(msg).catch((err) => this.logger.error(err, 'error re-sending message'));
        }, rate);
      } else {
        this.logger.error(err, 'reply failed');
      }
    }
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    throw new Error('not implemented');
  }

  public async receive(event: Event): Promise<void> {
    this.logger.debug({ event }, 'client got event');
    if (SOListener.isEventMessage(event)) {
      const msg = Message.create({
        body: event.content,
        context: this.getEventContext(event),
        reactions: []
      });
      return this.bot.receive(msg);
    }
  }
}

import {
  Channel,
  ChannelLogsQueryOptions,
  Client,
  Message as DiscordMessage,
  MessageReaction,
  PresenceData,
  ReactionEmoji,
  TextChannel,
  User,
} from 'discord.js';
import { isNil } from 'lodash';
import * as emoji from 'node-emoji';
import { Inject } from 'noicejs';
import { Counter } from 'prom-client';

import { ChildServiceOptions } from 'src/ChildService';
import { Message } from 'src/entity/Message';
import { BaseListener } from 'src/listener/BaseListener';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { ServiceModule } from 'src/module/ServiceModule';
import { ServiceDefinition } from 'src/Service';
import { TYPE_TEXT } from 'src/utils/Mime';
import { SessionProvider } from 'src/utils/SessionProvider';

export interface DiscordListenerData {
  presence?: PresenceData;
  sessionProvider: ServiceDefinition<any>;
  token: string;
}

export type DiscordListenerOptions = ChildServiceOptions<DiscordListenerData>;

@Inject('bot', 'metrics', 'services')
export class DiscordListener extends BaseListener<DiscordListenerData> implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return !isNil(chan) && chan.type === 'text';
  }

  protected readonly client: Client;
  protected readonly services: ServiceModule;
  protected readonly threads: Map<string, DiscordMessage>;

  protected readonly onCounter: Counter;

  protected sessionProvider: SessionProvider;

  constructor(options: DiscordListenerOptions) {
    super(options);

    this.client = new Client();
    this.services = options.services;
    this.threads = new Map();

    this.onCounter = new Counter({
      help: 'events received from discord client',
      labelNames: ['serviceId', 'serviceKind', 'serviceName', 'eventKind'],
      name: 'discord_events',
      registers: [options.metrics],
    });
  }

  public async start() {
    this.sessionProvider = await this.services.createService<SessionProvider, any>(this.data.sessionProvider);

    this.client.on('ready', () => {
      this.onCounter.inc({
        eventKind: 'ready',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.logger.debug('discord listener ready');
    });

    this.client.on('message', (msg) => {
      this.onCounter.inc({
        eventKind: 'message',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.threads.set(msg.id, msg);

      this.convertMessage(msg).then((it) => this.receive(it)).catch((err) => {
        this.logger.error(err, 'error receiving message');
      });
    });

    this.client.on('messageReactionAdd', (msgReaction, user) => {
      this.onCounter.inc({
        eventKind: 'messageReactionAdd',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.convertReaction(msgReaction, user).then((msg) => this.receive(msg)).catch((err) => {
        this.logger.error(err, 'error receiving reaction');
      });
    });

    this.client.on('debug', (msg) => {
      this.onCounter.inc({
        eventKind: 'debug',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.logger.debug({ upstream: msg }, 'debug from server');
    });

    this.client.on('error', (err) => {
      this.onCounter.inc({
        eventKind: 'error',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.logger.error(err, 'error from server');
    });

    this.client.on('warn', (msg) => {
      this.onCounter.inc({
        eventKind: 'warn',
        serviceId: this.id,
        serviceKind: this.kind,
        serviceName: this.name,
      });
      this.logger.warn({ upstream: msg }, 'warn from server');
    });

    await this.client.login(this.data.token);

    if (this.data.presence) {
      await this.client.user.setPresence(this.data.presence);
    }
  }

  public async stop() {
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('ready');
  }

  public async send(msg: Message): Promise<void> {
    // direct reply to message
    if (msg.context.threadId) {
      return this.replyToThread(msg);
    }

    // broad reply to channel
    if (msg.context.roomId) {
      return this.replyToChannel(msg);
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public async replyToThread(msg: Message) {
    const thread = this.threads.get(msg.context.threadId);
    if (!thread) {
      this.logger.warn({ msg }, 'message thread is missing');
      return;
    }

    if (msg.body.length) {
      await thread.reply(msg.body);
    }

    const reactions = this.filterEmoji(msg.reactions);
    for (const reaction of reactions) {
      this.logger.debug({ reaction }, 'adding reaction to thread');
      await thread.react(reaction);
    }

    return;
  }

  public async replyToChannel(msg: Message) {
    const channel = this.client.channels.get(msg.context.roomId);
    if (!channel) {
      this.logger.warn({ msg }, 'message channel is missing');
      return;
    }

    if (!DiscordListener.isTextChannel(channel)) {
      this.logger.warn('channel is not a text channel');
      return;
    }

    await channel.send(msg.body);
    return;
  }

  public filterEmoji(names: Array<string>) {
    const out = new Set();
    for (const name of names) {
      out.add(this.convertEmoji(name));
    }
    return Array.from(out);
  }

  public convertEmoji(name: string): string {
    const results = emoji.search(name);
    if (results.length) {
      return results[0].emoji;
    }

    const custom = this.client.emojis.find('name', name);

    if (custom) {
      return custom.id;
    }

    throw new Error(`could not find emoji: ${name}`);
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    const channel = this.client.channels.get(options.channel);
    if (!DiscordListener.isTextChannel(channel)) {
      throw new Error('channel is not a text channel');
    }

    // transform the options into https://discord.js.org/#/docs/main/stable/typedef/ChannelLogsQueryOptions
    const queryOptions = this.convertQueryOptions(options);
    const messages = [];
    for (const [_, msg] of await channel.fetchMessages(queryOptions)) {
      messages.push(this.convertMessage(msg));
    }

    return Promise.all(messages);
  }

  protected async convertMessage(msg: DiscordMessage): Promise<Message> {
    const context = await this.sessionProvider.createSessionContext({
      listenerId: this.id,
      roomId: msg.channel.id,
      threadId: msg.id,
      userId: msg.author.id,
      userName: msg.author.username,
    });
    return new Message({
      body: msg.content,
      context,
      reactions: msg.reactions.map((r) => r.emoji.name),
      type: TYPE_TEXT,
    });
  }

  protected async convertReaction(reaction: MessageReaction, user: User): Promise<Message> {
    const msg = await this.convertMessage(reaction.message);
    if (reaction.emoji instanceof ReactionEmoji) {
      const result = emoji.find(reaction.emoji.toString());
      msg.body = result ? result.key : 'missing emoji';
    } else {
      msg.body = reaction.emoji.name;
    }

    msg.context.userId = user.id;
    msg.context.userName = user.username;

    return msg;
  }

  protected convertQueryOptions(options: FetchOptions): ChannelLogsQueryOptions {
    if (options.after) {
      return {
        after: options.id,
        limit: options.count,
      };
    }

    if (options.before) {
      return {
        before: options.id,
        limit: options.count,
      };
    }

    return {
      around: options.id,
      limit: options.count,
    };
  }
}

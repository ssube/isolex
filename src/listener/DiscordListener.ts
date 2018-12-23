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

import { BotServiceOptions } from 'src/BotService';
import { Context, ContextData } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotFoundError } from 'src/error/NotFoundError';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { SessionListener } from 'src/listener/SessionListener';
import { ServiceModule } from 'src/module/ServiceModule';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface DiscordListenerData {
  presence?: PresenceData;
  token: string;
}

export type DiscordListenerOptions = BotServiceOptions<DiscordListenerData>;

@Inject('bot', 'clock', 'metrics', 'services')
export class DiscordListener extends SessionListener<DiscordListenerData> implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return !isNil(chan) && chan.type === 'text';
  }

  protected readonly client: Client;
  protected readonly services: ServiceModule;
  protected readonly threads: Map<string, DiscordMessage>;

  protected readonly onCounter: Counter;

  constructor(options: DiscordListenerOptions) {
    super(options, 'isolex#/definitions/service-listener-discord');

    this.client = new Client();
    this.services = options.services;
    this.threads = new Map();

    this.onCounter = new Counter({
      help: 'events received from discord client',
      labelNames: ['serviceId', 'serviceKind', 'serviceName', 'eventKind'],
      name: 'discord_event',
      registers: [options.metrics],
    });
  }

  public async start() {
    this.client.on('ready', () => this.onReady());
    this.client.on('message', (msg) => this.onMessage(msg));
    this.client.on('messageReactionAdd', (msgReaction, user) => this.onReaction(msgReaction, user));

    this.client.on('debug', (msg) => {
      this.countEvent('debug');
      this.logger.debug({ upstream: msg }, 'debug from server');
    });

    this.client.on('error', (err) => {
      this.countEvent('error');
      this.logger.error(err, 'error from server');
    });

    this.client.on('warn', (msg) => {
      this.countEvent('warn');
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
    if (msg.context.channel.thread) {
      return this.replyToThread(msg);
    }

    // broad reply to channel
    if (msg.context.channel.id) {
      return this.replyToChannel(msg);
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public async replyToThread(msg: Message) {
    const thread = this.threads.get(msg.context.channel.thread);
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
    const channel = this.client.channels.get(msg.context.channel.id);
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

    throw new NotFoundError(`could not find emoji: ${name}`);
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    const channel = this.client.channels.get(options.channel);
    if (!DiscordListener.isTextChannel(channel)) {
      throw new InvalidArgumentError('channel is not a text channel');
    }

    // transform the options into https://discord.js.org/#/docs/main/stable/typedef/ChannelLogsQueryOptions
    const queryOptions = this.convertQueryOptions(options);
    const messages = [];
    for (const [_, msg] of await channel.fetchMessages(queryOptions)) {
      messages.push(this.convertMessage(msg));
    }

    return Promise.all(messages);
  }

  public onMessage(msg: DiscordMessage) {
    this.countEvent('message');
    this.threads.set(msg.id, msg);
    this.convertMessage(msg).then((it) => this.bot.receive(it)).catch((err) => {
      this.logger.error(err, 'error receiving message');
    });
  }

  public onReaction(msgReaction: MessageReaction, user: User) {
    this.countEvent('messageReactionAdd');
    this.convertReaction(msgReaction, user).then((msg) => this.bot.receive(msg)).catch((err) => {
      this.logger.error(err, 'error receiving reaction');
    });
  }

  public onReady() {
    this.countEvent('ready');
    this.logger.debug('discord listener ready');
  }

  protected countEvent(eventKind: string) {
    this.onCounter.inc({
      eventKind,
      serviceId: this.id,
      serviceKind: this.kind,
      serviceName: this.name,
    });
  }

  protected async convertMessage(msg: DiscordMessage): Promise<Message> {
    this.logger.debug('converting discord message');
    const contextData: ContextData = {
      channel: {
        id: msg.channel.id,
        thread: msg.id,
      },
      name: msg.author.username,
      source: this,
      uid: msg.author.id,
    };

    const session = await this.getSession(msg.author.id);
    if (session) {
      contextData.user = session.user;
    }

    const context = new Context({
      ...contextData,
      source: this,
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

    msg.context.uid = user.id;
    msg.context.name = user.username;

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

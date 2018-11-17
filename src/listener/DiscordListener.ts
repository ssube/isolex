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

import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { BaseListener } from 'src/listener/BaseListener';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { ServiceOptions } from 'src/Service';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface DiscordListenerConfig {
  presence?: PresenceData;
  token: string;
}

export type DiscordListenerOptions = ServiceOptions<DiscordListenerConfig>;

export class DiscordListener extends BaseListener<DiscordListenerConfig> implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return !isNil(chan) && chan.type === 'text';
  }

  protected client: Client;
  // @TODO: this should be a WeakMap but lodash has a bad typedef
  protected threads: Map<string, DiscordMessage>;

  constructor(options: DiscordListenerOptions) {
    super(options);

    this.client = new Client();
    this.threads = new Map();
  }

  public async start() {
    this.client.on('ready', () => {
      this.logger.debug('discord listener ready');
    });

    this.client.on('message', (msg) => {
      this.threads.set(msg.id, msg);

      this.receive(this.convertMessage(msg)).catch((err) => this.logger.error(err, 'error receiving message'));
    });

    this.client.on('messageReactionAdd', (msgReaction, user) => {
      this.receive(this.convertReaction(msgReaction, user)).catch((err) => this.logger.error(err, 'error receiving reaction'));
    });

    this.client.on('warn', (msg) => {
      this.logger.warn({ msg }, 'warning from server');
    })

    await this.client.login(this.data.token);

    if (this.data.presence) {
      this.client.user.setPresence(this.data.presence);
    }
  }

  public async stop() {
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('ready');
  }

  public async check(context: Context) {
    return true;
  }

  public async emit(msg: Message): Promise<void> {
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

    return messages;
  }

  public async receive(value: Message) {
    return this.bot.receive(value);
  }

  protected convertMessage(msg: DiscordMessage): Message {
    return Message.create({
      body: msg.content,
      context: Context.create({
        listenerId: this.id,
        roomId: msg.channel.id,
        threadId: msg.id,
        userId: msg.author.id,
        userName: msg.author.username,
      }),
      reactions: msg.reactions.map((r) => r.emoji.name),
      type: TYPE_TEXT,
    });
  }

  protected convertReaction(reaction: MessageReaction, user: User): Message {
    const msg = this.convertMessage(reaction.message);
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

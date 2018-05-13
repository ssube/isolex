import { Channel, ChannelLogsQueryOptions, Client, Message as DiscordMessage, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import * as emoji from 'node-emoji';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { BaseListener } from 'src/listener/BaseListener';
import { FetchOptions, Listener } from 'src/listener/Listener';
import { ServiceConfig, ServiceOptions } from 'src/Service';

export interface DiscordListenerConfig extends ServiceConfig {
  token: string;
}

export type DiscordListenerOptions = ServiceOptions<DiscordListenerConfig>;

export class DiscordListener extends BaseListener<DiscordListenerConfig> implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return !isNil(chan) && chan.type === 'text';
  }

  protected client: Client;
  // @todo: this should be a WeakMap but lodash has a bad typedef
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
      this.receive(msg).catch((err) => this.logger.error(err, 'error receiving message'));
    });

    await this.client.login(this.config.token);
  }

  public async stop() {
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('ready');
  }

  public async check(context: Context) {
    return true;
  }

  public async emit(msg: Message) {
    // direct reply to message
    if (msg.context.threadId) {
      const thread = this.threads.get(msg.context.threadId);
      if (thread) {
        for (const reaction of msg.reactions) {
          const reactionEmoji = this.convertEmoji(reaction);
          this.logger.debug({ reactionEmoji }, 'reacting to thread');
          await thread.react(reactionEmoji);
        }

        if (msg.body.length) {
          await thread.reply(msg.body);
        }

        return;
      } else {
        this.logger.warn({ msg }, 'error emitting message to missing thread');
      }
    }

    // broad reply to channel
    if (msg.context.roomId) {
      const channel = this.client.channels.get(msg.context.roomId);
      if (DiscordListener.isTextChannel(channel)) {
        await channel.send(msg.body);
        return;
      } else {
        this.logger.warn({ msg }, 'cannot emit message to missing channel');
      }
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public convertEmoji(name: string): string {
    const custom = this.client.emojis.find('name', name);
    if (custom) {
      return custom.id;
    }

    return emoji.get(name);
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    const channel = this.client.channels.get(options.channel);
    if (!DiscordListener.isTextChannel(channel)) {
      throw new Error();
    }

    // transform the options into https://discord.js.org/#/docs/main/stable/typedef/ChannelLogsQueryOptions
    const queryOptions = this.convertQueryOptions(options);
    const messages = [];
    for (const [_, msg] of await channel.fetchMessages(queryOptions)) {
      messages.push(this.convertMessage(msg));
    }

    return messages;
  }

  public async receive(value: DiscordMessage) {
    this.threads.set(value.id, value);

    // turn it into an internal Message
    await this.bot.receive(this.convertMessage(value));
  }

  protected convertMessage(msg: DiscordMessage): Message {
    return Message.create({
      body: msg.content,
      context: Context.create({
        listenerId: this.id,
        roomId: msg.channel.id,
        threadId: msg.id,
        userId: msg.author.id,
        userName: msg.author.username
      }),
      reactions: msg.reactions.map((r) => r.emoji.name)
    });
  }

  protected convertQueryOptions(options: FetchOptions): ChannelLogsQueryOptions {
    if (options.after) {
      return {
        after: options.id,
        limit: options.count
      };
    }

    if (options.before) {
      return {
        before: options.id,
        limit: options.count
      };
    }

    return {
      around: options.id,
      limit: options.count
    };
  }
}

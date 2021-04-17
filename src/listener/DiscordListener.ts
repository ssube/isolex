import { doesExist, InvalidArgumentError, isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
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
import escape from 'escape-html';
import emoji from 'node-emoji';
import { Inject } from 'noicejs';

import { FetchOptions, Listener, ListenerData } from '.';
import { INJECT_CLOCK, INJECT_METRICS } from '../BaseService';
import { BotServiceOptions } from '../BotService';
import { Context, ContextOptions } from '../entity/Context';
import { Message } from '../entity/Message';
import { createServiceCounter, incrementServiceCounter, StringCounter } from '../utils/Metrics';
import { TYPE_TEXT } from '../utils/Mime';
import { SessionListener } from './SessionListener';

export interface DiscordListenerData extends ListenerData {
  presence?: PresenceData;
  token: string;
}

@Inject(INJECT_CLOCK, INJECT_METRICS)
export class DiscordListener extends SessionListener<DiscordListenerData> implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return doesExist(chan) && chan.type === 'text';
  }

  protected readonly client: Client;
  protected readonly threads: Map<string, DiscordMessage>;

  protected readonly onCounter: StringCounter;
  protected readonly sendCounter: StringCounter;

  constructor(options: BotServiceOptions<DiscordListenerData>) {
    super(options, 'isolex#/definitions/service-listener-discord');

    this.client = new Client();
    this.threads = new Map();

    const metrics = mustExist(options[INJECT_METRICS]);
    this.onCounter = createServiceCounter(metrics, {
      help: 'events received from discord client',
      labelNames: ['eventKind'],
      name: 'listener_discord_event',
    });
    this.sendCounter = createServiceCounter(metrics, {
      help: 'events send from discord client',
      labelNames: ['sendType'],
      name: 'listener_discord_send',
    });
  }

  public async start() {
    await super.start();

    this.client.on('ready', () => {
      this.onReady();
    });

    this.client.on('message', (msg) => {
      this.onMessage(msg);
    });

    this.client.on('messageReactionAdd', (msgReaction, user) => {
      this.onReaction(msgReaction, user);
    });

    this.startClientLogger();
    await this.client.login(this.data.token);

    if (doesExist(this.data.presence)) {
      await this.client.user.setPresence(this.data.presence);
    }
  }

  public async stop() {
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('ready');
    await this.client.destroy();

    await super.stop();
  }

  public async send(msg: Message): Promise<void> {
    const ctx = mustExist(msg.context);

    // direct reply to message
    if (ctx.channel.thread !== '') {
      return this.replyToThread(msg, ctx);
    }

    // broad reply to channel
    if (ctx.channel.id !== '') {
      return this.replyToChannel(msg, ctx);
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    const channel = this.client.channels.get(options.channel);

    /* eslint-disable-next-line no-restricted-syntax */
    if (!DiscordListener.isTextChannel(channel)) {
      throw new InvalidArgumentError('channel is not a text channel');
    }

    // transform the options into https://discord.js.org/#/docs/main/stable/typedef/ChannelLogsQueryOptions
    const queryOptions = this.convertQueryOptions(options);
    const messages = [];
    for (const [/* key */, msg] of await channel.fetchMessages(queryOptions)) {
      messages.push(this.convertMessage(msg));
    }

    return Promise.all(messages);
  }

  public onMessage(input: DiscordMessage) {
    this.countEvent('message');
    this.threads.set(input.id, input);
    this.convertMessage(input).then((msg) => this.bot.receive(msg)).catch((err) => {
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
    incrementServiceCounter(this, this.onCounter, {
      eventKind,
    });
  }

  protected async replyToThread(msg: Message, ctx: Context) {
    const thread = this.threads.get(ctx.channel.thread);
    if (isNil(thread)) {
      this.logger.warn({ msg }, 'message thread is missing');
      return;
    }

    if (msg.body.length > 0) {
      incrementServiceCounter(this, this.sendCounter, {
        sendType: 'thread',
      });
      await thread.reply(escape(msg.body));
    }

    const reactions = this.filterEmoji(msg.reactions);
    for (const reaction of reactions) {
      incrementServiceCounter(this, this.sendCounter, {
        sendType: 'reaction',
      });

      this.logger.debug({ reaction }, 'adding reaction to thread');
      await thread.react(reaction);
    }
  }

  protected async replyToChannel(msg: Message, ctx: Context) {
    const channel = this.client.channels.get(ctx.channel.id);
    if (isNil(channel)) {
      this.logger.warn({ msg }, 'message channel is missing');
      return;
    }

    /* eslint-disable-next-line no-restricted-syntax */
    if (!DiscordListener.isTextChannel(channel)) {
      this.logger.warn('channel is not a text channel');
      return;
    }

    incrementServiceCounter(this, this.sendCounter, {
      sendType: 'channel',
    });

    await channel.send(escape(msg.body));
  }

  protected filterEmoji(names: Array<string>): Array<string> {
    const out = new Set<string>();
    for (const name of names) {
      out.add(this.convertEmoji(name));
    }
    return Array.from(out);
  }

  protected convertEmoji(name: string): string {
    const results = emoji.search(name);
    if (results.length > 0) {
      return results[0].emoji;
    }

    const custom = this.client.emojis.find('name', name);

    if (doesExist(custom)) {
      return custom.id;
    }

    throw new NotFoundError(`could not find emoji: ${name}`);
  }

  protected async convertMessage(msg: DiscordMessage): Promise<Message> {
    this.logger.debug('converting discord message');
    const contextData: ContextOptions = {
      channel: {
        id: msg.channel.id,
        thread: msg.id,
      },
      source: this.getMetadata(),
      sourceUser: {
        name: msg.author.username,
        uid: msg.author.id,
      },
    };

    const session = await this.getSession(msg.author.id);
    if (doesExist(session)) {
      contextData.user = session.user;
    }

    this.logger.debug({
      context: contextData,
      session,
    }, 'converted message options')

    const context = await this.createContext(contextData);
    return new Message({
      body: msg.content,
      context,
      labels: this.labels,
      reactions: msg.reactions.map((r) => r.emoji.name),
      type: TYPE_TEXT,
    });
  }

  protected async convertReaction(reaction: MessageReaction, user: User): Promise<Message> {
    const msg = await this.convertMessage(reaction.message);
    if (reaction.emoji instanceof ReactionEmoji) {
      const result = emoji.find(reaction.emoji.toString());
      if (doesExist(result)) {
        msg.body = result.key;
      } else {
        msg.body = 'missing emoji';
      }
    } else {
      msg.body = reaction.emoji.name;
    }

    const msgContext = mustExist(msg.context);
    msg.context = await this.createContext({
      ...msgContext,
      sourceUser: {
        name: user.username,
        uid: user.id,
      },
    });

    return msg;
  }

  protected convertQueryOptions(options: FetchOptions): ChannelLogsQueryOptions {
    if (doesExist(options.after)) {
      return {
        after: options.id,
        limit: options.count,
      };
    }

    if (doesExist(options.before)) {
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

  protected startClientLogger() {
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
  }
}

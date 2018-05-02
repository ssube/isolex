import { Channel, Client, Message as DiscordMessage, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Listener } from 'src/listener/Listener';
import { Message } from 'src/Message';
import { ServiceOptions } from 'src/Service';

export interface DiscordListenerConfig {
  token: string;
}

export interface DiscordListenerOptions extends ServiceOptions<DiscordListenerConfig> {

}

export class DiscordListener implements Listener {
  public static isTextChannel(chan: Channel | undefined): chan is TextChannel {
    return !isNil(chan) && chan.type === 'text';
  }

  protected bot: Bot;
  protected client: Client;
  protected config: DiscordListenerConfig;
  protected logger: Logger;
  // @todo: this should be a WeakMap but lodash has a bad typedef
  protected threads: Map<string, DiscordMessage>;

  constructor(options: DiscordListenerOptions) {
    this.bot = options.bot;
    this.client = new Client();
    this.config = options.config;
    this.logger = options.logger.child({
      class: DiscordListener.name
    });
    this.threads = new Map();
  }

  public async start() {
    this.client.on('ready', () => {
      this.logger.debug('discord listener ready');
    });

    this.client.on('message', (msg) => {
      this.receive(msg);
    });

    this.client.login(this.config.token);
  }

  public async stop() {
    this.client.removeAllListeners('message');
    this.client.removeAllListeners('ready');
  }

  public async emit(msg: Message) {
    // direct reply msg
    if (msg.context.threadId) {
      const thread = this.threads.get(msg.context.threadId);
      if (thread) {
        for (const reaction of msg.reactions) {
          this.client.emojis.forEach((e) => this.logger.debug({ e }, 'found emoji'));

          const emoji = this.client.emojis.find('name', reaction);
          if (emoji) {
            await thread.react(emoji.id);
          } else {
            this.logger.warn({ reaction }, 'missing emoji for reaction');
          }
        }

        if (msg.body.length) {
          await thread.reply(msg.body);
        }

        return;
      } else {
        this.logger.warn({ msg }, 'error emitting message to missing thread');
      }
    }

    // broad reply channel
    if (msg.context.roomId) {
      const channel = this.client.channels.get(msg.context.roomId);
      if (DiscordListener.isTextChannel(channel)) {
        channel.send(msg.body);
        return;
      } else {
        this.logger.warn({ msg }, 'cannot emit message to missing channel');
      }
    }

    // fail
    this.logger.error('invalid destination for message');
  }

  public async receive(value: DiscordMessage) {
    this.threads.set(value.id, value);

    // turn it into an internal Message
    const msg = new Message({
      body: value.content,
      context: {
        roomId: value.channel.id,
        threadId: value.id,
        userId: value.author.id,
        userName: value.author.username
      },
      reactions: value.reactions.map((r) => r.emoji.name)
    });
    await this.bot.receive(msg);
  }
}

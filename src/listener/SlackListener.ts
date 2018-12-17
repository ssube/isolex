import { RTMClient, WebClient } from '@slack/client';
import { isNil } from 'lodash';
import { BaseError, Inject, logWithLevel } from 'noicejs';

import { ChildServiceOptions } from 'src/ChildService';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { NotFoundError } from 'src/error/NotFoundError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { TYPE_TEXT } from 'src/utils/Mime';

import { Listener } from './Listener';
import { SessionListener } from './SessionListener';

export interface SlackListenerData {
  token: {
    bot: string;
    web: string;
  };
}

export type SlackListenerOptions = ChildServiceOptions<SlackListenerData>;

@Inject('bot', 'clock')
export class SlackListener extends SessionListener<SlackListenerData> implements Listener {
  protected client: RTMClient;
  protected webClient: WebClient;

  constructor(options: SlackListenerOptions) {
    super(options);
  }

  public async send(msg: Message): Promise<void> {
    if (msg.context.channel.id) {
      const result = await this.client.sendMessage(msg.body, msg.context.channel.id);
      if (result.error) {
        const err = new BaseError(result.error.msg);
        this.logger.error(err, 'error sending slack message');
        throw err;
      }
      return;
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public async fetch(): Promise<Array<Message>> {
    throw new NotImplementedError('slack listener cannot fetch specific messages yet');
  }

  public async start() {
    this.client = new RTMClient(this.data.token.bot, {
      logger: (level, msg) => logWithLevel(this.logger, level, { msg }, 'slack client logged message'),
    });
    this.webClient = new WebClient(this.data.token.web);

    this.client.on('message', (msg) => {
      this.convertMessage(msg).then((it) => this.bot.receive(it)).catch((err) => this.logger.error(err, 'error receiving message'));
    });

    this.client.on('reaction_added', (reaction) => {
      this.convertReaction(reaction).then((msg) => this.bot.receive(msg)).catch((err) => this.logger.error(err, 'error adding reaction'));
    });

    await this.client.start();
  }

  public async stop() {
    await this.client.disconnect();
  }

  protected async convertReaction(reaction: any): Promise<Message> {
    this.logger.debug({ reaction }, 'converting slack reaction');
    const search = await this.webClient.channels.history({
      channel: reaction.item.channel,
      inclusive: true,
      latest: reaction.item.ts,
      oldest: reaction.item.ts,
    });

    if (!search.ok) {
      throw new NotFoundError('message not found for reaction');
    }

    const [head] = (search as any).messages;
    return this.convertMessage({
      ...head,
      channel: reaction.item.channel,
    });
  }

  protected async convertMessage(msg: any): Promise<Message> {
    const {type, channel, user: uid, text, ts} = msg;
    this.logger.debug({ channel, text, ts, type, uid }, 'converting slack message');
    const context = new Context({
      channel: {
        id: channel,
        thread: '',
      },
      name: uid,
      source: this,
      uid,
    });
    const session = await this.getSession(uid);
    if (session) {
      context.user = session.user;
    }
    return new Message({
      body: text,
      context,
      reactions: this.reactionNames(msg.reactions),
      type: TYPE_TEXT,
    });
  }

  protected reactionNames(reactions: Array<any> | undefined): Array<string> {
    if (isNil(reactions)) {
      return [];
    }

    return reactions.map((it) => it.name);
  }
}

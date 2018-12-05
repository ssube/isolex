import { RTMClient, WebClient } from '@slack/client';
import { isNil } from 'lodash';
import { BaseError, logWithLevel } from 'noicejs';

import { ChildServiceOptions } from 'src/ChildService';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { TYPE_TEXT } from 'src/utils/Mime';

import { BaseListener } from './BaseListener';
import { Listener } from './Listener';

export interface SlackListenerData {
  token: string;
}

export type SlackListenerOptions = ChildServiceOptions<SlackListenerData>;

export class SlackListener extends BaseListener<SlackListenerData> implements Listener {
  protected client: RTMClient;
  protected webClient: WebClient;

  constructor(options: SlackListenerOptions) {
    super(options);
  }

  public async send(msg: Message): Promise<void> {
    if (msg.context.roomId) {
      const result = await this.client.sendMessage(msg.body, msg.context.roomId);
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
    this.client = new RTMClient(this.data.token, {
      logger: (level, msg) => logWithLevel(this.logger, level, { msg }, 'slack client logged message'),
    });

    this.client.on('message', (msg) => {
      this.convertMessage(msg).then((it) => this.receive(it)).catch((err) => this.logger.error(err, 'error receiving message'));
    });

    this.client.on('reaction_added', (reaction) => {
      this.convertReaction(reaction).then((msg) => this.receive(msg)).catch((err) => this.logger.error(err, 'error adding reaction'));
    });

    await this.client.start();
  }

  public async stop() {
    await this.client.disconnect();
  }

  protected async convertReaction(msg: any): Promise<Message> {
    const search = await this.webClient.channels.history({
      channel: msg.item.channel,
      inclusive: true,
      latest: msg.item.ts,
      oldest: msg.item.ts,
    });

    if (!search.ok) {
      // handle that
    }

    const [head] = (search as any).messages;
    return this.convertMessage({
      ...head,
      channel: msg.item.channel,
    });
  }

  protected async convertMessage(msg: any): Promise<Message> {
    const {type, channel, user, text, ts} = msg;
    this.logger.debug({ channel, text, ts, type, user }, 'converting slack message');
    const context = new Context({
      listenerId: this.id,
      roomId: channel,
      threadId: '',
      userId: user,
      userName: user,
    });
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

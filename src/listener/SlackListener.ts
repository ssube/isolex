import { RTMClient } from '@slack/client';
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

  constructor(options: SlackListenerOptions) {
    super(options);
  }

  public async emit(msg: Message): Promise<void> {
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
      this.receive(this.convertMessage(msg)).catch((err) => this.logger.error(err, 'error receiving message'));
    });

    await this.client.start();
  }

  public async stop() {
    await this.client.disconnect();
  }

  protected convertMessage(msg: any): Message {
    const {type, channel, user, text, ts} = msg;
    this.logger.debug({ channel, text, ts, type, user }, 'converting slack message');
    const context = Context.create({
      listenerId: this.id,
      roomId: channel,
      threadId: '',
      userId: user,
      userName: user,
    });
    return Message.create({
      body: text,
      context,
      reactions: this.convertReactions(msg.reactions),
      type: TYPE_TEXT,
    });
  }

  protected convertReactions(reactions: Array<any> | undefined): Array<string> {
    if (isNil(reactions)) {
      return [];
    }

    return reactions.map((it) => it.name);
  }
}

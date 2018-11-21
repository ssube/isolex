import { RTMClient } from '@slack/client';

import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { ServiceOptions } from 'src/Service';
import { TYPE_TEXT } from 'src/utils/Mime';

import { BaseListener } from './BaseListener';
import { Listener } from './Listener';

export interface SlackListenerData {
  token: string;
}

export type SlackListenerOptions = ServiceOptions<SlackListenerData>;

export class SlackListener extends BaseListener<SlackListenerData> implements Listener {
  protected client: RTMClient;

  constructor(options: SlackListenerOptions) {
    super(options);
  }

  public async emit(): Promise<void> {
    throw new NotImplementedError('slack listener cannot emit messages yet');
  }

  public async fetch(): Promise<Array<Message>> {
    throw new NotImplementedError('slack listener cannot fetch specific messages yet');
  }

  public async start() {
    this.client = new RTMClient(this.data.token);

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
      reactions: [],
      type: TYPE_TEXT,
    });
  }
}
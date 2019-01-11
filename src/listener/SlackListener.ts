import { LogLevel, RTMClient, WebAPICallResult, WebClient } from '@slack/client';
import * as escape from 'escape-html';
import { isNil } from 'lodash';
import { BaseError, Inject, logWithLevel } from 'noicejs';

import { INJECT_CLOCK } from 'src/BaseService';
import { BotServiceOptions } from 'src/BotService';
import { Message } from 'src/entity/Message';
import { NotFoundError } from 'src/error/NotFoundError';
import { FetchOptions, Listener, ListenerData } from 'src/listener';
import { SessionListener } from 'src/listener/SessionListener';
import { doesExist, mustExist } from 'src/utils';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface SlackListenerData extends ListenerData {
  fetch: {
    window: number;
  };
  token: {
    bot: string;
    web: string;
  };
}

export interface SlackReaction {
  item: {
    channel: string;
    ts: string;
  };
}

export interface SlackMessage {
  channel: string;
  reactions: Array<SlackMessageReaction>;
  text: string;
  ts: string;
  type: string;
  user: string;
}

export interface SlackMessageReaction {
  name: string;
}

export interface SlackSearchResults extends WebAPICallResult {
  messages: Array<SlackMessage>;
}

@Inject(INJECT_CLOCK)
export class SlackListener extends SessionListener<SlackListenerData> implements Listener {
  protected client?: RTMClient;
  protected webClient?: WebClient;

  constructor(options: BotServiceOptions<SlackListenerData>) {
    super(options, 'isolex#/definitions/service-listener-slack');
  }

  public async send(msg: Message): Promise<void> {
    const client = mustExist(this.client);
    const ctx = mustExist(msg.context);

    if (doesExist(ctx.channel.id)) {
      const result = await client.sendMessage(escape(msg.body), ctx.channel.id);
      if (doesExist(result.error)) {
        const err = new BaseError(result.error.msg);
        this.logger.error(err, 'error sending slack message');
        throw err;
      }
      return;
    }

    // fail
    this.logger.error('could not find destination in message context');
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    const client = mustExist(this.webClient);
    const latest = this.clock.getSeconds();
    const oldest = latest - this.data.fetch.window;
    const search = await client.channels.history({
      channel: mustExist(options.channel),
      inclusive: true,
      latest: latest.toString(),
      oldest: oldest.toString(),
    }) as SlackSearchResults;

    if (!search.ok) {
      throw new NotFoundError('message not found for reaction');
    }

    const messages = await Promise.all(search.messages.map((msg) => this.convertMessage(msg)));
    this.logger.debug({ messages }, 'fetched slack messages');
    return messages;
  }

  public async start() {
    await super.start();

    const logger = (level: LogLevel, msg: string) => {
      logWithLevel(this.logger, level, { msg }, 'slack client logged message');
    };
    this.client = new RTMClient(this.data.token.bot, { logger });
    this.webClient = new WebClient(this.data.token.web, { logger });

    this.client.on('message', (msg) => {
      this.convertMessage(msg).then((it) => this.bot.receive(it)).catch((err) => {
        this.logger.error(err, 'error receiving message');
      });
    });

    this.client.on('reaction_added', (reaction) => {
      this.convertReaction(reaction).then((msg) => this.bot.receive(msg)).catch((err) => {
        this.logger.error(err, 'error adding reaction');
      });
    });

    await this.client.start();
  }

  public async stop() {
    await mustExist(this.client).disconnect();
  }

  protected async convertReaction(reaction: SlackReaction): Promise<Message> {
    this.logger.debug({ reaction }, 'converting slack reaction');
    const client = mustExist(this.webClient);
    const search = await client.channels.history({
      channel: reaction.item.channel,
      inclusive: true,
      latest: reaction.item.ts,
      oldest: reaction.item.ts,
    }) as SlackSearchResults;

    if (!search.ok) {
      throw new NotFoundError('message not found for reaction');
    }

    const [head] = search.messages;
    return this.convertMessage({
      ...head,
      channel: reaction.item.channel,
    });
  }

  protected async convertMessage(msg: SlackMessage): Promise<Message> {
    const { type, channel, user: uid, text, ts } = msg;
    this.logger.debug({ channel, text, ts, type, uid }, 'converting slack message');

    const context = await this.createContext({
      channel: {
        id: channel,
        thread: '',
      },
      name: uid,
      uid,
    });
    const session = await this.getSession(uid);
    if (doesExist(session)) {
      context.user = session.user;
    }

    const result = new Message({
      body: text,
      context,
      labels: this.labels,
      reactions: this.reactionNames(msg.reactions),
      type: TYPE_TEXT,
    });
    this.logger.debug({ result }, 'converted slack message');
    return result;
  }

  protected reactionNames(reactions: Array<SlackMessageReaction> | undefined): Array<string> {
    if (isNil(reactions)) {
      return [];
    }

    return reactions.map((it) => it.name);
  }
}

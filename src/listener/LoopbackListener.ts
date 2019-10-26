import { FetchOptions, Listener, ListenerData } from '.';
import { BotServiceOptions } from '../BotService';
import { User } from '../entity/auth/User';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { NotImplementedError } from '../error/NotImplementedError';
import { BaseListener } from './BaseListener';

export class LoopbackListener extends BaseListener<ListenerData> implements Listener {
  constructor(options: BotServiceOptions<ListenerData>) {
    super(options, 'isolex#/definitions/service-listener-loopback');
  }

  public async send(msg: Message): Promise<void> {
    await this.bot.receive(msg);
  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    throw new NotImplementedError();
  }

  public async createSession(uid: string, user: User): Promise<Session> {
    throw new NotImplementedError();
  }

  public async getSession(uid: string): Promise<Session | undefined> {
    return undefined;
  }
}

import { FetchOptions, Listener, ListenerData } from '.';
import { BotServiceOptions } from '../BotService';
import { User } from '../entity/auth/User';
import { ContextRedirect, redirectContext } from '../entity/Context';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { NotImplementedError } from '../error/NotImplementedError';
import { mustExist } from '../utils';
import { BaseListener } from './BaseListener';

export interface LoopbackListenerData extends ListenerData {
  redirect: ContextRedirect;
}

export class LoopbackListener extends BaseListener<LoopbackListenerData> implements Listener {
  constructor(options: BotServiceOptions<LoopbackListenerData>) {
    super(options, 'isolex#/definitions/service-listener-loopback');
  }

  public async send(msg: Message): Promise<void> {
    const ctx = mustExist(msg.context);

    const outCtx = await this.createContext(ctx);
    const outMsg = new Message(msg);
    outMsg.context = redirectContext(outCtx, this.data.redirect);

    await this.bot.receive(outMsg);
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

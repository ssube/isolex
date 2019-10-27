import { FetchOptions, Listener, ListenerData } from '.';
import { BotServiceOptions } from '../BotService';
import { User } from '../entity/auth/User';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { NotImplementedError } from '../error/NotImplementedError';
import { ServiceMetadata } from '../Service';
import { mustExist } from '../utils';
import { BaseListener } from './BaseListener';

export interface LoopbackListenerData extends ListenerData {
  defaultTarget: ServiceMetadata;
}

export class LoopbackListener extends BaseListener<LoopbackListenerData> implements Listener {
  protected target?: Listener;

  constructor(options: BotServiceOptions<LoopbackListenerData>) {
    super(options, 'isolex#/definitions/service-listener-loopback');
  }

  public async start() {
    await super.start();

    this.target = this.services.getService<Listener>(this.data.defaultTarget);
  }

  public async send(msg: Message): Promise<void> {
    const ctx = mustExist(msg.context);
    const target = mustExist(this.target);

    const outCtx = await this.createContext(ctx);
    outCtx.source = target;
    outCtx.target = target;

    const outMsg = new Message(msg);
    outMsg.context = outCtx;

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

import { Inject } from 'noicejs';

import { FetchOptions, Listener, ListenerData } from '.';
import { INJECT_CLOCK } from '../BaseService';
import { BotServiceOptions } from '../BotService';
import { User } from '../entity/auth/User';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { mustExist } from '../utils';
import { Clock } from '../utils/Clock';
import { BaseListener } from './BaseListener';

/**
 * A listener that tracks sessions.
 */

@Inject(INJECT_CLOCK)
export abstract class SessionListener<TData extends ListenerData> extends BaseListener<TData> implements Listener {
  protected readonly clock: Clock;
  protected readonly sessions: Map<string, Session>;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = mustExist(options[INJECT_CLOCK]);
    this.sessions = new Map();
  }

  public abstract send(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public async createSession(uid: string, user: User): Promise<Session> {
    const now = this.clock.getDate();
    const session = {
      createdAt: now,
      expiresAt: now,
      user,
    };
    this.sessions.set(uid, session);
    return session;
  }

  /**
   * @TODO: check session start/end time
   */
  public async getSession(uid: string): Promise<Session | undefined> {
    return this.sessions.get(uid);
  }
}

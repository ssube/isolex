import { Inject } from 'noicejs';

import { INJECT_CLOCK } from 'src/BaseService';
import { BotServiceOptions } from 'src/BotService';
import { User } from 'src/entity/auth/User';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { FetchOptions, Listener, ListenerData } from 'src/listener';
import { BaseListener } from 'src/listener/BaseListener';
import { mustExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';

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

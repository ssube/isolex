import { BotServiceOptions } from 'src/ChildService';
import { User } from 'src/entity/auth/User';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { BaseListener } from 'src/listener/BaseListener';
import { FetchOptions } from 'src/listener/Listener';
import { Clock } from 'src/utils/Clock';

/**
 * A listener that tracks sessions.
 */

export abstract class SessionListener<TData> extends BaseListener<TData> {
  protected readonly clock: Clock;
  protected readonly sessions: Map<string, Session>;

  constructor(options: BotServiceOptions<TData>, schemaPath: string) {
    super(options, schemaPath);

    this.clock = options.clock;
    this.sessions = new Map();
  }

  public abstract send(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;

  public async createSession(uid: string, user: User): Promise<Session> {
    const now = this.clock.getSeconds();
    const session = {
      createdAt: now,
      expiresAt: now,
      user,
    };
    this.sessions.set(uid, session);
    return session;
  }

  public async getSession(uid: string): Promise<Session | undefined> {
    return this.sessions.get(uid);
  }
}

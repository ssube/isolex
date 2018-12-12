import { ChildServiceOptions } from 'src/ChildService';
import { User } from 'src/entity/auth/User';
import { Message } from 'src/entity/Message';

import { BaseListener } from './BaseListener';
import { FetchOptions } from './Listener';

export interface Session {
  createdAt: number;
  expiresAt: number;
  user: User;
}

/**
 * A listener that tracks sessions.
 */

export abstract class SessionListener<TData> extends BaseListener<TData> {
  protected sessions: Map<string, Session>;

  constructor(options: ChildServiceOptions<TData>) {
    super(options);
    this.sessions = new Map();
  }

  public abstract send(msg: Message): Promise<void>;

  public abstract fetch(options: FetchOptions): Promise<Array<Message>>;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;

  public async createSession(uid: string, user: User): Promise<Session> {
    const now = Math.floor(Date.now() / 1000);
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

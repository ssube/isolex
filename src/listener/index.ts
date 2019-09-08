import { BotServiceData } from '../BotService';
import { User } from '../entity/auth/User';
import { Message } from '../entity/Message';
import { Session } from '../entity/Session';
import { Service } from '../Service';

export interface FetchOptions {
  after?: number;
  before?: number;
  channel: string;
  count?: number;
  id?: string;
}

export type ListenerData = BotServiceData;

export interface ContextFetchOptions extends FetchOptions {
  listenerId: string;
  useFilters: boolean;
}

export interface Listener extends Service {
  /**
   * Check a message, incoming or outgoing, before sending it.
   */
  check(msg: Message): Promise<boolean>;

  /**
   * Sends a message.
   */
  send(msg: Message): Promise<void>;

  /**
   * Fetch some messages.
   */
  fetch(options: FetchOptions): Promise<Array<Message>>;

  /**
   * Callback from the auth controller to associate a particular uid with a user, thus establishing a session.
   */
  createSession(uid: string, user: User): Promise<Session>;

  /**
   * Callback from the auth controller to get a session from a uid.
   */
  getSession(uid: string): Promise<Session | undefined>;
}

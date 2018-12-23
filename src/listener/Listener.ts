import { BotServiceOptions } from 'src/ChildService';
import { User } from 'src/entity/auth/User';
import { Context } from 'src/entity/Context';
import { Message } from 'src/entity/Message';
import { Session } from 'src/entity/Session';
import { Service } from 'src/Service';

export interface FetchOptions {
  after?: boolean;
  before?: boolean;
  channel: string;
  count?: number;
  id?: string;
}

export type ListenerData = any;
export type ListenerOptions<TData extends ListenerData> = BotServiceOptions<TData>;

export interface ContextFetchOptions extends FetchOptions {
  listenerId: string;
  useFilters: boolean;
}

export interface Listener extends Service {
  check(context: Context): Promise<boolean>;

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

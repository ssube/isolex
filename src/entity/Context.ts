import { MissingValueError } from 'noicejs';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Listener } from 'src/listener/Listener';
import { Parser } from 'src/parser/Parser';

import { Token } from './auth/Token';
import { User } from './auth/User';

export interface ChannelData {
  id: string;
  thread: string;
}

export interface ContextData {
  channel: ChannelData;

  /**
   * User's display name.
   */
  name: string;

  source: Listener;

  token?: Token;

  /**
   * User authenticated with this context.
   */
  user?: User;

  /**
   * Unique ID for this user, only meaningful to/within the listener.
   */
  uid: string;
}

export const TABLE_CONTEXT = 'context';

@Entity(TABLE_CONTEXT)
export class Context implements ContextData {
  @Column('simple-json')
  public channel: ChannelData;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  public parser?: Parser;

  public source: Listener;

  public target?: Listener;

  public token?: Token;

  @Column()
  public uid: string;

  public user?: User;

  constructor(options?: ContextData) {
    if (options) {
      if (!options.name || !options.uid) {
        throw new MissingValueError('name and uid must be specified in context options');
      }
      this.channel = {
        id: options.channel.id,
        thread: options.channel.thread,
      };
      this.name = options.name;
      this.source = options.source;
      this.token = options.token;
      this.uid = options.uid;
      this.user = options.user;
    }
  }

  public extend(options: Partial<ContextData>): Context {
    const ctx = new Context(this);
    if (options.token) {
      ctx.token = options.token;
    }
    if (options.user) {
      ctx.user = options.user;
    }
    return ctx;
  }

  /**
   * @TODO: meaningful return value
   */
  public toJSON(): any {
    return {
      id: this.id,
    };
  }
}

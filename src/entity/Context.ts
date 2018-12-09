import { flatten } from 'lodash';
import { MissingValueError } from 'noicejs';
import { newTrie } from 'shiro-trie';
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
   * Check if a set of Shiro-style permissions have been granted to this context. This will check both the
   * token and user, if available, and permissions must appear in both (so that the grants on a token restrict the
   * grants on a user). If neither is present, permissions are simply denied.
   */
  public permit(permissions: Array<string>): boolean {
    if (this.token && !this.token.permit(permissions)) {
      return false;
    }

    const userPermissions = this.getPermissions();
    if (!userPermissions.length) {
      return false;
    }

    const trie = newTrie();
    trie.add(...userPermissions);
    return permissions.every((p) => {
      const result = trie.check(p);
      return result;
    });
  }

  public getPermissions(): Array<string> {
    if (this.user) {
      return flatten(this.user.roles.map((r) => r.grants));
    } else {
      return [];
    }
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

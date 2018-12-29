import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { flatten } from 'lodash';
import { MissingValueError } from 'noicejs';
import { newTrie } from 'shiro-trie';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Token } from 'src/entity/auth/Token';
import { GRAPH_OUTPUT_USER, User } from 'src/entity/auth/User';
import { Listener } from 'src/listener/Listener';
import { Parser } from 'src/parser/Parser';
import { BaseEntity } from './base/BaseEntity';

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

  parser?: Parser;

  source: Listener;

  target?: Listener;

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
export class Context extends BaseEntity implements ContextData {
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
    super();

    if (options) {
      if (!options.name || !options.uid) {
        throw new MissingValueError('name and uid must be specified in context options');
      }
      this.channel = {
        id: options.channel.id,
        thread: options.channel.thread,
      };
      this.name = options.name;
      this.parser = options.parser;
      this.source = options.source;
      this.target = options.target;
      this.token = options.token;
      this.uid = options.uid;
      this.user = options.user;
    }
  }

  public extend(options: Partial<ContextData>): Context {
    const ctx = new Context(this);
    if (options.parser) {
      ctx.parser = options.parser;
    }
    if (options.target) {
      ctx.target = options.target;
    }
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
   * token and user, if available, and grants must appear in both (so that the grants on a token restrict the
   * grants on a user).
   */
  public checkGrants(checks: Array<string>): boolean {
    if (this.token && !this.token.permit(checks)) {
      return false;
    }

    const grants = this.getGrants();
    if (!grants.length) {
      return false;
    }

    const trie = newTrie();
    trie.add(...grants);
    return checks.every((p) => trie.check(p));
  }

  public listGrants(checks: Array<string>): Array<string> {
    const grants = this.getGrants();
    if (!grants.length) {
      return [];
    }

    const trie = newTrie();
    trie.add(...grants);
    return flatten(checks.map((p) => trie.permissions(p)));
  }

  public getGrants(): Array<string> {
    if (this.user) {
      return flatten(this.user.roles.map((r) => r.grants));
    } else {
      return [];
    }
  }

  /**
   * Get a unique and hopefully persistent user ID.
   *
   * If this context does not have a logged in user, default to the listener-provided UID.
   */
  public getUserId(): string {
    if (this.user) {
      return this.user.id;
    } else {
      return this.uid;
    }
  }

  public toJSON(): any {
    const user = this.user ? this.user.toJSON() : {};
    return {
      channel: this.channel,
      id: this.id,
      name: this.name,
      source: this.source.id,
      uid: this.uid,
      user,
    };
  }
}

export const GRAPH_INPUT_CHANNEL = new GraphQLInputObjectType({
  fields: {
    id: {
      type: GraphQLString,
    },
    thread: {
      type: GraphQLString,
    },
  },
  name: 'ChannelInput',
});

export const GRAPH_INPUT_CONTEXT = new GraphQLInputObjectType({
  fields: {
    channel: {
      type: GRAPH_INPUT_CHANNEL,
    },
    name: {
      type: GraphQLString,
    },
    uid: {
      type: GraphQLString,
    },
  },
  name: 'ContextInput',
});

export const GRAPH_OUTPUT_CHANNEL = new GraphQLObjectType({
  fields: {
    id: {
      type: GraphQLString,
    },
    thread: {
      type: GraphQLString,
    },
  },
  name: 'Channel',
});

export const GRAPH_OUTPUT_CONTEXT = new GraphQLObjectType({
  fields: {
    channel: {
      type: GRAPH_OUTPUT_CHANNEL,
    },
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    uid: {
      type: GraphQLString,
    },
    user: {
      type: GRAPH_OUTPUT_USER,
    },
  },
  name: 'Context',
});

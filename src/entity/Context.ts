import { doesExist, isNil, NotFoundError } from '@apextoaster/js-utils';
import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { flatten } from 'lodash';
import { MissingValueError } from 'noicejs';
import { newTrie, ShiroTrie } from 'shiro-trie';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Parser } from '../parser';
import { ServiceMetadata } from '../Service';
import { Token } from './auth/Token';
import { GRAPH_OUTPUT_USER, User } from './auth/User';
import { BaseEntity, BaseEntityOptions } from './base/BaseEntity';

/**
 * Listener-specific channel.
 */
export interface ContextChannel {
  id: string;
  thread: string;
}

/**
 * Listener-specific user.
 */
export interface ContextUser {
  /**
   * User's display name.
   */
  name: string;

  /**
   * Unique ID for this user, only meaningful to/within the listener.
   */
  uid: string;
}

export interface ContextData {
  channel: ContextChannel;
  source?: ServiceMetadata;
  sourceUser: ContextUser;
  target?: ServiceMetadata;
}

export interface ContextOptions extends BaseEntityOptions, ContextData {
  parser?: Parser;

  token?: Token;

  /**
   * User authenticated with this context.
   */
  user?: User;
}

interface ContextRoute {
  channel?: ContextChannel;
  loopback?: boolean;
  target?: ServiceMetadata;
}

export interface ContextRedirect {
  defaults: ContextRoute;
  forces: ContextRoute;
}

export const TABLE_CONTEXT = 'context';

@Entity(TABLE_CONTEXT)
export class Context extends BaseEntity implements ContextOptions {
  @Column('simple-json')
  public channel: ContextChannel;

  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  public parser?: Parser;

  public source?: ServiceMetadata;

  public target?: ServiceMetadata;

  public token?: Token;

  public user?: User;

  public sourceUser: ContextUser;

  constructor(options: ContextOptions) {
    super(options);

    if (doesExist(options)) {
      if (isNil(options.sourceUser.name)) {
        throw new MissingValueError('name must be specified in context options');
      }

      if (isNil(options.sourceUser.uid)) {
        throw new MissingValueError('uid must be specified in context options');
      }

      this.channel = {
        id: options.channel.id,
        thread: options.channel.thread,
      };
      this.parser = options.parser;
      this.token = options.token;
      this.user = options.user;

      // TODO: these should be taken from options.user or removed entirely
      this.sourceUser = {
        ...options.sourceUser,
      };

      // TODO: what are these for? entity should not link services
      this.source = options.source;
      this.target = options.target;
    } else {
      this.channel = {
        id: '',
        thread: '',
      };
      this.sourceUser = {
        name: '',
        uid: '',
      };
    }
  }

  public buildTrie(): ShiroTrie {
    const grants = this.getGrants();
    const trie = newTrie();
    trie.add(...grants);
    return trie;
  }

  /**
   * Check if a set of Shiro-style permissions have been granted to this context. This will check both the
   * token and user, if available, and grants must appear in both (so that the grants on a token restrict the
   * grants on a user).
   */
  public checkGrants(checks: Array<string>): boolean {
    if (doesExist(this.token)) {
      return this.token.checkGrants(checks);
    }

    const trie = this.buildTrie();
    return checks.every((p) => trie.check(p));
  }

  public listGrants(checks: Array<string>): Array<string> {
    const trie = this.buildTrie();
    return flatten(checks.map((p) => trie.permissions(p)));
  }

  public getGrants(): Array<string> {
    if (doesExist(this.user)) {
      return flatten(this.user.roles.map((r) => r.grants));
    } else {
      return [];
    }
  }

  /**
   * Get the authenticated user's ID.
   */
  public getUserId(): string {
    if (doesExist(this.user) && doesExist(this.user.id)) {
      return this.user.id;
    } else {
      throw new NotFoundError();
    }
  }

  /* eslint-disable-next-line @typescript-eslint/ban-types */
  public toJSON(): object {
    return {
      channel: this.channel,
      id: this.id,
      sourceUser: this.sourceUser,
      user: this.user,
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

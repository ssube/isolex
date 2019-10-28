import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from 'graphql';
import { flatten, isNil } from 'lodash';
import { MissingValueError } from 'noicejs';
import { newTrie, ShiroTrie } from 'shiro-trie';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { NotFoundError } from '../error/NotFoundError';
import { Listener } from '../listener';
import { ServiceModule } from '../module/ServiceModule';
import { Parser } from '../parser';
import { ServiceMetadata } from '../Service';
import { doesExist, mustCoalesce, mustExist, Optional } from '../utils';
import { Token } from './auth/Token';
import { GRAPH_OUTPUT_USER, User } from './auth/User';
import { BaseEntity, BaseEntityOptions } from './base/BaseEntity';

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

  /**
   * Unique ID for this user, only meaningful to/within the listener.
   */
  uid: string;
}

export interface ContextRoute {
  source?: Listener;
  target?: Listener;
}

export interface ContextOptions extends BaseEntityOptions, ContextData, ContextRoute {
  parser?: Parser;

  token?: Token;

  /**
   * User authenticated with this context.
   */
  user?: User;
}

export interface ListenerRedirect {
  source?: boolean;
  service?: ServiceMetadata;
  target?: boolean;
}

export interface ContextRedirectStage extends ContextData {
  source?: ListenerRedirect;
  target?: ListenerRedirect;
}

export interface ContextRedirect {
  defaults: Partial<ContextRedirectStage>;
  forces: Partial<ContextRedirectStage>;
}

export const TABLE_CONTEXT = 'context';

@Entity(TABLE_CONTEXT)
export class Context extends BaseEntity implements ContextOptions, ContextRoute {
  @Column('simple-json')
  public channel: ChannelData;

  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  public name: string;

  public parser?: Parser;

  public source?: Listener;

  public target?: Listener;

  public token?: Token;

  @Column()
  public uid: string;

  public user?: User;

  constructor(options: ContextOptions) {
    super(options);

    if (doesExist(options)) {
      if (isNil(options.name)) {
        throw new MissingValueError('name must be specified in context options');
      }

      if (isNil(options.uid)) {
        throw new MissingValueError('uid must be specified in context options');
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
    } else {
      this.channel = {
        id: '',
        thread: '',
      };
      this.name = '';
      this.uid = '';
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
    if (doesExist(this.token) && !this.token.checkGrants(checks)) {
      return false;
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
   * Get a unique and hopefully persistent user ID.
   *
   * If this context does not have a logged in user, default to the listener-provided UID.
   */
  public getUserId(): string {
    if (doesExist(this.user) && doesExist(this.user.id)) {
      return this.user.id;
    } else {
      return this.uid;
    }
  }

  public toJSON(): object {
    return {
      channel: this.channel,
      id: this.id,
      name: this.name,
      uid: this.uid,
      user: this.user,
    };
  }
}

export function extractRedirect(stage: Optional<Partial<ContextRedirectStage>>): Partial<ContextData> {
  if (isNil(stage)) {
    return {};
  }

  const {
    channel,
    name,
    uid,
  } = stage;

  return {
    channel,
    name,
    uid,
  };
}

export function redirectServiceRoute(original: Context, route: ListenerRedirect, services: ServiceModule): Listener | undefined {
  if (route.source === true) {
    return mustExist(original.source);
  }

  if (route.target === true) {
    return mustExist(original.target);
  }

  if (doesExist(route.service)) {
    return services.getService<Listener>(route.service);
  }

  return undefined;
}

export function redirectService(original: Context, redirect: ContextRedirect, services: ServiceModule, key: 'source' | 'target'): Listener {
  // check forces
  const forces = redirect.forces[key];
  if (doesExist(forces)) {
    const forced = redirectServiceRoute(original, forces, services);
    if (doesExist(forced)) {
      return forced;
    }
  }

  // check original
  const originalListener = original[key];
  if (doesExist(originalListener)) {
    return originalListener;
  }

  // check defaults
  const defaults = redirect.defaults[key];
  if (doesExist(defaults)) {
    const defaulted = redirectServiceRoute(original, defaults, services);
    if (doesExist(defaulted)) {
      return defaulted;
    }
  }

  throw new NotFoundError();
}

export function redirectContext(original: Context, redirect: ContextRedirect, services: ServiceModule): Context {
  const channel = mustCoalesce(redirect.forces.channel, original.channel, redirect.defaults.channel);
  const name = mustCoalesce(redirect.forces.name, original.name, redirect.defaults.name);
  const uid = mustCoalesce(redirect.forces.uid, original.uid, redirect.defaults.uid);
  const user = original.user;
  // loop up source and target services, user
  const source = redirectService(original, redirect, services, 'source');
  const target = redirectService(original, redirect, services, 'target');

  return new Context({
    channel,
    name,
    source,
    target,
    uid,
    user,
  });
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

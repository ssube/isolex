import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { doesExist } from '../../utils';
import { BaseEntity, BaseEntityOptions } from '../base/BaseEntity';
import { GRAPH_OUTPUT_ROLE, Role } from './Role';

export interface UserLocale {
  date: string;
  lang: string;
  time: string;
  timezone: string;
}

export interface UserOptions extends BaseEntityOptions {
  locale: UserLocale;
  name: string;
  roles: Array<Role>;
}

/**
 * TODO: do this without hard-coded fallbacks
 */
export const LOCALE_DEFAULT = {
  date: 'YYYY-MM-DD',
  lang: 'en-US',
  time: 'HH:MM:SSZ',
  timezone: 'GMT',
};

export const TABLE_USER = 'user';

@Entity(TABLE_USER)
export class User extends BaseEntity implements UserOptions {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({
    type: 'simple-json',
  })
  public locale: UserLocale;

  @Column({
    unique: true,
  })
  public name: string = '';

  @Column({
    name: 'roles',
    type: 'simple-json',
  })
  public roleNames: Array<string> = [];

  public roles: Array<Role> = [];

  constructor(options: UserOptions) {
    super(options);

    if (doesExist(options)) {
      this.locale = {
        ...LOCALE_DEFAULT,
        ...options.locale,
      };
      this.name = options.name;
      this.roles = options.roles;
    } else {
      this.locale = {
        ...LOCALE_DEFAULT,
      };
    }
  }

  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      roles: this.roleNames,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  protected syncRoles() {
    this.roleNames = this.roles.map((it) => it.name);
  }
}

export const GRAPH_OUTPUT_USER = new GraphQLObjectType({
  fields: {
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    roles: {
      type: new GraphQLList(GRAPH_OUTPUT_ROLE),
    },
  },
  name: 'User',
});

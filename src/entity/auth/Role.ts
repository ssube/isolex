import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { doesExist } from '../../utils';
import { BaseEntity, BaseEntityOptions } from '../base/BaseEntity';

export interface RoleOptions extends BaseEntityOptions {
  grants: Array<string>;
  name: string;
}

export const TABLE_ROLE = 'role';

@Entity(TABLE_ROLE)
export class Role extends BaseEntity implements RoleOptions {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({
    unique: true,
  })
  public name = '';

  @Column('simple-json')
  public grants: Array<string> = [];

  constructor(options: RoleOptions) {
    super(options);

    if (doesExist(options)) {
      this.grants = options.grants;
      this.name = options.name;
    }
  }

  public toJSON() {
    return {
      grants: this.grants,
      id: this.id,
      name: this.name,
    };
  }
}

export const GRAPH_OUTPUT_ROLE = new GraphQLObjectType({
  fields: {
    grants: {
      type: new GraphQLList(GraphQLString),
    },
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
  },
  name: 'Role',
});

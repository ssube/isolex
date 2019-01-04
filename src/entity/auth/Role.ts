import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';

export interface RoleOptions {
  grants: Array<string>;
  name: string;
}

export const TABLE_ROLE = 'role';

@Entity(TABLE_ROLE)
export class Role extends BaseEntity implements RoleOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string = '';

  @Column({
    unique: true,
  })
  public name: string = '';

  @Column('simple-json')
  public grants: Array<string> = [];

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

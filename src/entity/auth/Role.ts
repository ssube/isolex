import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

export interface RoleOptions {
  name: string;
  grants: Array<string>;
}

@Entity()
export class Role extends BaseEntity implements RoleOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    unique: true,
  })
  public name: string;

  @Column('simple-json')
  public grants: Array<string>;

  constructor(options?: RoleOptions) {
    super();

    if (options) {
      this.grants = Array.from(options.grants);
      this.name = options.name;
    }
  }

  public toJSON() {
    return {
      id: this.id,
      grants: this.grants,
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

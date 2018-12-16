import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface RoleOptions {
  name: string;
  grants: Array<string>;
}

@Entity()
export class Role implements RoleOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    unique: true,
  })
  public name: string;

  @Column('simple-json')
  public grants: Array<string>;

  constructor(options?: RoleOptions) {
    if (options) {
      this.grants = Array.from(options.grants);
      this.name = options.name;
    }
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

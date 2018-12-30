import { GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { BaseEntity } from './base/BaseEntity';

export const TABLE_TICK = 'tick';

@Entity(TABLE_TICK)
export class Tick extends BaseEntity {
  @CreateDateColumn()
  public createdAt: number;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public intervalId: string;

  @Column()
  public status: number;

  @UpdateDateColumn()
  public updatedAt: number;

  public toJSON(): object {
    return {
      createdAt: this.createdAt,
      id: this.id,
      intervalId: this.intervalId,
      updatedAt: this.updatedAt,
    };
  }
}

export const GRAPH_OUTPUT_TICK = new GraphQLObjectType({
  fields: {
    createdAt: {
      type: GraphQLString,
    },
    id: {
      type: GraphQLString,
    },
    intervalId: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
  },
  name: 'Tick',
});

import { GraphQLObjectType, GraphQLString } from 'graphql';
import { isNil } from 'lodash';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity, BaseEntityOptions } from 'src/entity/base/BaseEntity';

export const TABLE_TICK = 'tick';

export interface TickOptions extends BaseEntityOptions {
  intervalId: string;
  status: number;
}

@Entity(TABLE_TICK)
export class Tick extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string = '';

  @Column()
  public intervalId: string = '';

  @Column()
  public status: number = 0;

  constructor(options: TickOptions) {
    super(options);

    if (!isNil(options)) {
      this.intervalId = options.intervalId;
      this.status = options.status;
    }
  }

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

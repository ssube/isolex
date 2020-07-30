import { doesExist } from '@apextoaster/js-utils';
import { GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity, BaseEntityOptions } from './base/BaseEntity';

export const TABLE_TICK = 'tick';

export interface TickOptions extends BaseEntityOptions {
  intervalId: string;
  status: number;
}

@Entity(TABLE_TICK)
export class Tick extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({
    type: 'varchar',
  })
  public intervalId = '';

  @Column({
    type: 'int',
  })
  public status = 0;

  constructor(options: TickOptions) {
    super(options);

    if (doesExist(options)) {
      this.intervalId = options.intervalId;
      this.status = options.status;
    }
  }

  /* eslint-disable-next-line @typescript-eslint/ban-types */
  public toJSON(): object {
    return {
      createdAt: this.createdAt,
      id: this.id,
      intervalId: this.intervalId,
      status: this.status,
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

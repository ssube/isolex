import { doesExist } from '@apextoaster/js-utils';
import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from '../schema/graph/output/Pairs';
import { BaseCommand } from './base/BaseCommand';
import { CommandOptions } from './Command';

export const TABLE_FRAGMENT = 'fragment';

export interface FragmentOptions extends CommandOptions {
  /**
   * The next key to be filled.
   *
   * For the Lex parser, this is a slot within the intent (noun).
   */
  key: string;

  parserId: string;

  userId: string;
}

@Entity(TABLE_FRAGMENT)
export class Fragment extends BaseCommand implements FragmentOptions {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({
    type: 'varchar',
  })
  public key = '';

  @Column({
    type: 'varchar',
  })
  public parserId = '';

  @Column({
    type: 'varchar',
  })
  public userId = '';

  constructor(options: FragmentOptions) {
    super(options);

    if (doesExist(options)) {
      this.key = options.key;
      this.parserId = options.parserId;
      this.userId = options.userId;
    }
  }

  /* eslint-disable-next-line @typescript-eslint/ban-types */
  public toJSON(): object {
    return {
      data: this.data,
      id: this.id,
      key: this.key,
      noun: this.noun,
      parserId: this.parserId,
      userId: this.userId,
      verb: this.verb,
    };
  }
}

export const GRAPH_OUTPUT_FRAGMENT = new GraphQLObjectType({
  description: 'a command fragment for later completion',
  fields: {
    data: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR),
    },
    id: {
      type: GraphQLID,
    },
    key: {
      type: GraphQLString,
    },
    labels: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_VALUE_PAIR),
    },
    parserId: {
      type: GraphQLString,
    },
  },
  name: 'Fragment',
});

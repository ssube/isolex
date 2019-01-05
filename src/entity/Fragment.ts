import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { isNil } from 'lodash';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseCommand } from 'src/entity/base/BaseCommand';
import { CommandOptions } from 'src/entity/Command';
import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from 'src/schema/graph/output/Pairs';

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
  public id: string = '';

  @Column()
  public key: string = '';

  @Column()
  public parserId: string = '';

  @Column()
  public userId: string = '';

  constructor(options: FragmentOptions) {
    super(options);

    if (!isNil(options)) {
      this.key = options.key;
      this.parserId = options.parserId;
      this.userId = options.userId;
    }
  }

  public toJSON() {
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

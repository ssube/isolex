import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from 'src/graph/output/Pairs';
import { dictToMap } from 'src/utils/Map';

import { BaseCommand } from './base/BaseCommand';
import { CommandOptions } from './Command';

export interface FragmentOptions extends CommandOptions {
  /**
   * The next key to be filled.
   *
   * For the Lex parser, this is a slot within the intent (noun).
   */
  key: string;

  parserId: string;
}

@Entity()
export class Fragment extends BaseCommand implements FragmentOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

  @Column()
  public parserId: string;

  constructor(options?: FragmentOptions) {
    super(options);

    if (options) {
      this.data = dictToMap(options.data);
      this.key = options.key;
      this.labels = dictToMap(options.labels);
      this.noun = options.noun;
      this.parserId = options.parserId;
      this.verb = options.verb;
    }
  }

  public toJSON() {
    return {
      data: this.data,
      id: this.id,
      key: this.key,
      noun: this.noun,
      parserId: this.parserId,
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

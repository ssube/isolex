import { Dict, doesExist } from '@apextoaster/js-utils';
import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Context, GRAPH_OUTPUT_CONTEXT } from '../entity/Context';
import { GRAPH_INPUT_NAME_MULTI_VALUE_PAIR, GRAPH_INPUT_NAME_VALUE_PAIR } from '../schema/graph/input/Pairs';
import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from '../schema/graph/output/Pairs';
import { BaseCommand, BaseCommandOptions } from './base/BaseCommand';

export enum CommandVerb {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  Help = 'help',
  List = 'list',
  Update = 'update',
}

export interface CommandOptions extends BaseCommandOptions {
  context?: Context;
}

export type CommandData = Map<string, CommandDataValue>;
export type CommandDataValue = Array<string>;
export const TABLE_COMMAND = 'command';

@Entity(TABLE_COMMAND)
export class Command extends BaseCommand implements CommandOptions {
  public static isCommand(it: unknown): it is Command {
    return it instanceof Command;
  }

  @OneToOne((type) => Context, (context) => context.id, {
    cascade: true,
  })
  @JoinColumn()
  public context?: Context;

  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  constructor(options: CommandOptions) {
    super(options);

    if (doesExist(options)) {
      this.context = options.context;
    }
  }

  public toJSON(): object {
    const result: Dict<unknown> = {
      data: Array.from(this.data),
      labels: Array.from(this.labels),
      noun: this.noun,
      verb: this.verb,
    };

    if (doesExist(this.context)) {
      result.context = this.context.toJSON();
    }

    if (doesExist(this.id)) {
      result.id = this.id;
    }

    return result;
  }
}

export const GRAPH_INPUT_COMMAND = new GraphQLInputObjectType({
  description: 'a command to be executed',
  fields: {
    data: {
      type: new GraphQLList(GRAPH_INPUT_NAME_MULTI_VALUE_PAIR),
    },
    labels: {
      type: new GraphQLList(GRAPH_INPUT_NAME_VALUE_PAIR),
    },
    noun: {
      type: GraphQLString,
    },
    verb: {
      type: GraphQLString,
    },
  },
  name: 'CommandInput',
});

export const GRAPH_OUTPUT_COMMAND = new GraphQLObjectType({
  fields: {
    context: {
      type: GRAPH_OUTPUT_CONTEXT,
    },
    data: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR),
    },
    id: {
      type: GraphQLID,
    },
    labels: {
      type: new GraphQLList(GRAPH_OUTPUT_NAME_VALUE_PAIR),
    },
    noun: {
      type: GraphQLString,
    },
    verb: {
      type: GraphQLString,
    },
  },
  name: 'Command',
});

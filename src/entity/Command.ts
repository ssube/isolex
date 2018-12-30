import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseCommand, BaseCommandOptions } from 'src/entity/base/BaseCommand';
import { Context, GRAPH_OUTPUT_CONTEXT } from 'src/entity/Context';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { GRAPH_INPUT_NAME_MULTI_VALUE_PAIR, GRAPH_INPUT_NAME_VALUE_PAIR } from 'src/schema/graph/input/Pairs';
import { GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR, GRAPH_OUTPUT_NAME_VALUE_PAIR } from 'src/schema/graph/output/Pairs';
import { dictToMap, pushMergeMap } from 'src/utils/Map';

export enum CommandVerb {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  List = 'list',
  Update = 'update',
  Watch = 'watch',
}

export interface CommandOptions extends BaseCommandOptions {
  context?: Context;
}

export type CommandData = Map<string, CommandDataValue>;
export type CommandDataValue = Array<string>;
export const TABLE_COMMAND = 'command';

@Entity(TABLE_COMMAND)
export class Command extends BaseCommand implements CommandOptions {
  public static isCommand(it: any): it is Command {
    return it instanceof Command;
  }

  @OneToOne((type) => Context, (context) => context.id, {
    cascade: true,
  })
  @JoinColumn()
  public context: Context;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  constructor(options?: CommandOptions) {
    super(options);

    if (options && options.context) {
      this.context = options.context;
    }
  }

  public extend(options: Partial<CommandOptions>) {
    if (options.noun) {
      throw new InvalidArgumentError('extended commands may not change noun');
    }
    if (options.verb) {
      throw new InvalidArgumentError('extended commands may not change verb');
    }

    const cmd = new Command(this);
    if (options.context) {
      cmd.context = options.context;
    }
    if (options.data) {
      cmd.data = pushMergeMap(cmd.data, dictToMap(options.data));
    }
    return cmd;
  }

  public toJSON(): object {
    return {
      context: this.context.toJSON(),
      data: Array.from(this.data),
      id: this.id,
      noun: this.noun,
      verb: this.verb,
    };
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

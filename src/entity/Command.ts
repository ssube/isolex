import { GraphQLObjectType, GraphQLString, GraphQLInputObjectType } from 'graphql';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Context } from 'src/entity/Context';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { dictToMap, MapLike, mergeMap } from 'src/utils/Map';

import { BaseCommand, BaseCommandOptions } from './base/BaseCommand';

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

export type CommandDataValue = Array<string>;
export const TABLE_COMMAND = 'command';

@Entity(TABLE_COMMAND)
export class Command extends BaseCommand implements CommandOptions {
  /**
   * @TODO: merge emit data and passed data
   */
  public static emit(emit: CommandOptions, context: Context, data: MapLike<CommandDataValue>) {
    return new Command({
      ...emit,
      context,
      data,
    });
  }

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
      cmd.data = mergeMap(cmd.data, dictToMap(options.data));
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

export const CommandGraph = new GraphQLObjectType({
  fields: {
    id: {
      type: GraphQLString,
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

export const CommandInputGraph = new GraphQLInputObjectType({
  fields: {
    noun: {
      type: GraphQLString,
    },
    verb: {
      type: GraphQLString,
    },
  },
  name: 'CommandInput',
});

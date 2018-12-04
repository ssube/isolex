import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Context } from 'src/entity/Context';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { dictToMap, MapOrMapLike, mergeMap } from 'src/utils';

import { BaseCommand } from './base/BaseCommand';

export enum CommandVerb {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  List = 'list',
  Update = 'update',
  Watch = 'watch',
}

export interface CommandData {
  data: MapOrMapLike<CommandDataValue>;
  labels: MapOrMapLike<string>;
  noun: string;
  verb: CommandVerb;
}

export interface CommandOptions extends CommandData {
  context: Context;
}

export type CommandDataType = Map<string, CommandDataValue>;
export type CommandDataValue = Array<string>;

@Entity()
export class Command extends BaseCommand implements CommandOptions {
  public static create(options: CommandOptions) {
    if (!options.noun) {
      throw new InvalidArgumentError('command must have noun');
    }

    if (!options.verb) {
      throw new InvalidArgumentError('command must have verb');
    }

    const cmd = new Command();
    cmd.context = Context.create(options.context);
    cmd.data = dictToMap(options.data);
    cmd.labels = dictToMap(options.labels);
    cmd.noun = options.noun;
    cmd.verb = options.verb;
    return cmd;
  }

  /**
   * @TODO: merge emit data and passed data
   */
  public static emit(emit: CommandData, context: Context, data: MapOrMapLike<CommandDataValue>) {
    return Command.create({
      context,
      data,
      labels: emit.labels,
      noun: emit.noun,
      verb: emit.verb,
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

  public extend(options: Partial<CommandOptions>) {
    if (options.noun) {
      throw new InvalidArgumentError('extended commands may not change noun');
    }
    if (options.verb) {
      throw new InvalidArgumentError('extended commands may not change verb');
    }

    const cmd = Command.create(this);
    if (options.context) {
      cmd.context = Context.create(options.context);
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

import { isNil } from 'lodash';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from 'src/entity/BaseEntity';
import { Context } from 'src/entity/Context';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { MapOrMapLike, mergeMap, dictToMap, getOrDefault, getHeadOrDefault } from 'src/utils';

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
export class Command extends BaseEntity implements CommandOptions {
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

  public data: Map<string, Array<string>>;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public noun: string;

  public labels: Map<string, string>;

  @Column()
  public verb: CommandVerb;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

  @Column({
    name: 'labels',
  })
  protected labelStr: string;

  constructor() {
    super();

    this.data = new Map();
  }

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

  public has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get a data item. Makes the command act like a read-only map.
   */
  public get(key: string): Array<string> {
    const value = this.data.get(key);
    if (value === undefined) {
      throw new Error(`missing key: ${key}`);
    }
    return value;
  }

  public getHead(key: string): string {
    const value = this.get(key);
    return value[0];
  }

  public getOrDefault(key: string, defaultValue: Array<string>): Array<string> {
    return getOrDefault(this.data, key, defaultValue);
  }
  
  public getHeadOrDefault(key: string, defaultValue: string): string {
    return getHeadOrDefault(this.data, key, defaultValue);
  }

  @AfterLoad()
  public syncMap() {
    this.data = new Map(JSON.parse(this.dataStr));
    this.labels = new Map(JSON.parse(this.labelStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    this.dataStr = JSON.stringify(Array.from(this.data));
    this.labelStr = JSON.stringify(Array.from(this.labels));
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

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
import { MapOrMapLike, mergeMap, normalizeMap } from 'src/utils';
import { isNil } from 'lodash';

export enum CommandVerb {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  List = 'list',
  Update = 'update',
  Watch = 'watch',
}

export interface CommandOptions {
  context: Context;
  data: MapOrMapLike<CommandArgsList>;
  noun: string;
  verb: CommandVerb;
}

export type CommandArgsMap = Map<string, CommandArgsList>;
export type CommandArgsItem = string;
export type CommandArgsList = Array<CommandArgsItem>;

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
    cmd.data = normalizeMap(options.data);
    cmd.noun = options.noun;
    cmd.verb = options.verb;
    return cmd;
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

  @Column()
  public verb: CommandVerb;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

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
      cmd.data = mergeMap(cmd.data, normalizeMap(options.data));
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

  public getOrDefault(key: string, defaultValue: Array<string>): Array<string> {
    if (this.has(key)) {
      const data = this.get(key);
      if (isNil(data)) {
        return defaultValue;
      } else {
        return data;
      }
    } else {
      return defaultValue;
    }
  }

  public getHeadOrDefault(key: string, defaultValue: string): string {
    if (this.has(key)) {
      const data = this.get(key);
      if (data.length > 0) {
        return data[0];
      } else {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  }

  @AfterLoad()
  public syncMap() {
    this.data = new Map(JSON.parse(this.dataStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    this.dataStr = JSON.stringify(Array.from(this.data));
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

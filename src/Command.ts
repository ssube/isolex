import { isMap } from 'lodash';
import { Context } from 'src/Context';
import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum CommandType {
  None,
  Admin,
  Query
}

export interface CommandOptions {
  context: Context;
  data: any;
  name: string;
  type: CommandType;
}

export type CommandPropMap = Map<string, CommandPropValue>;
export type CommandPropObject = {[key: string]: CommandPropValue};
export type CommandPropValue = string | Array<string>;

@Entity()
export class Command implements CommandOptions {
  public static toPropMap(value: CommandPropMap | CommandPropObject): CommandPropMap {
    if (isMap(value)) {
      return value;
    } else {
      return new Map(Object.entries(value));
    }
  }

  @Column('simple-json')
  public context: Context;

  @Column('simple-json')
  public data: CommandPropMap;

  @PrimaryColumn()
  public id: string;

  @Column()
  public name: string;

  @Column()
  public type: CommandType;

  public static create(options: CommandOptions) {
    const cmd = new Command();
    cmd.context = options.context;
    cmd.data = Command.toPropMap(options.data);
    cmd.name = options.name;
    cmd.type = options.type;
    return cmd;
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get a data item. Makes the command act like a read-only map.
   */
  public get(key: string): any {
    return this.data.get(key);
  }

  public toJSON(): object {
    return {
      context: this.context,
      data: this.data.entries(),
      name: this.name,
      type: this.type
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

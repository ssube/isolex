import { isMap } from 'lodash';
import { Context } from 'src/Context';

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

export class Command implements CommandOptions {
  public static toPropMap(value: CommandPropMap | CommandPropObject): CommandPropMap {
    if (isMap(value)) {
      return value;
    } else {
      return new Map(Object.entries(value));
    }
  }

  public readonly context: Context;
  public readonly data: CommandPropMap;
  public readonly name: string;
  public readonly type: CommandType;

  /**
   * Create a new command
   * @todo copy data
   */
  constructor(options: CommandOptions) {
    this.context = options.context;
    this.data = Command.toPropMap(options.data);
    this.name = options.name;
    this.type = options.type;
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
}

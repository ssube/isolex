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

export class Command implements CommandOptions {
  public readonly context: Context;
  public readonly data: any;
  public readonly name: string;
  public readonly type: CommandType;

  /**
   * Create a new command
   * @todo copy data
   */
  constructor(options: CommandOptions) {
    this.context = options.context;
    this.data = options.data;
    this.name = options.name;
    this.type = options.type;
  }

  public has(key: string): boolean {
    return Object.getOwnPropertyDescriptor(this.data, key) !== undefined;
  }

  /**
   * Get a data item. Makes the command act like a read-only map.
   */
  public get(key: string): any {
    return this.data[key];
  }
}

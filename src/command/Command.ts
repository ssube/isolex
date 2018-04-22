import { Destination } from 'src/Destination';

export enum CommandType {
  None,
  Admin,
  Query
}

export interface CommandOptions {
  data: any;
  from: Destination;
  name: string;
  type: CommandType;
}

export class Command implements CommandOptions {
  public readonly data: any;
  public readonly from: Destination;
  public readonly name: string;
  public readonly type: CommandType;

  /**
   * Create a new command
   * @todo copy data
   */
  constructor(options: CommandOptions) {
    this.data = options.data;
    this.from = options.from;
    this.name = options.name;
    this.type = options.type;
  }

  /**
   * Get a data item. Makes the command act like a read-only map.
   */
  public get(key: string): any {
    return this.data.get(key);
  }
}

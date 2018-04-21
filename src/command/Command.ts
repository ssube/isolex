export enum CommandType {
  None,
  Admin,
  Query
}

export interface CommandOptions {
  data: Map<string, any>;
  name: string;
  type: CommandType;
}

export class Command implements CommandOptions {
  public readonly type: CommandType;
  public readonly name: string;
  public readonly data: Map<string, any>;

  constructor(options: CommandOptions) {
    this.data = new Map(options.data.entries());
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
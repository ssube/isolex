import { Context } from 'src/entity/Context';
import { mergeMap, normalizeMap } from 'src/utils';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum CommandType {
  None,
  Admin,
  Query,
}

export interface CommandOptions {
  context: Context;
  data: any;
  name: string;
  type: CommandType;
}

export type CommandPropMap = Map<string, CommandPropValue>;
export type CommandPropValue = string | Array<string>;

@Entity()
export class Command implements CommandOptions {
  public static create(options: CommandOptions) {
    const cmd = new Command();
    cmd.context = Context.create(options.context);
    cmd.data = normalizeMap(options.data);
    cmd.name = options.name;
    cmd.type = options.type;
    return cmd;
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
  public name: string;

  @Column()
  public type: CommandType;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

  constructor() {
    this.data = new Map();
  }

  public extend(options: Partial<CommandOptions>) {
    const cmd = Command.create(this);
    if (options.context) {
      cmd.context = Context.create(options.context);
    }
    if (options.data) {
      cmd.data = mergeMap(cmd.data, normalizeMap(options.data));
    }
    if (options.name) {
      cmd.name = options.name;
    }
    if (options.type) {
      cmd.type = options.type;
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
      context: this.context,
      data: Array.from(this.data.entries()),
      id: this.id,
      name: this.name,
      type: this.type,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

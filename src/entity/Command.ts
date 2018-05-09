import { isMap } from 'lodash';
import { Context } from 'src/entity/Context';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
export type CommandPropValue = string | Array<string>;

export interface CommandPropObject {
  [key: string]: CommandPropValue;
}

@Entity()
export class Command implements CommandOptions {
  public static toPropMap(value: CommandPropMap | CommandPropObject): CommandPropMap {
    if (isMap(value)) {
      return new Map(value.entries());
    } else {
      return new Map(Object.entries(value));
    }
  }

  public static create(options: CommandOptions) {
    const cmd = new Command();
    cmd.context = Context.create(options.context);
    cmd.data = Command.toPropMap(options.data);
    cmd.name = options.name;
    cmd.type = options.type;
    return cmd;
  }

  @OneToOne((type) => Context, (context) => context.id, {
    cascade: true
  })
  @JoinColumn()
  public context: Context;

  public data: CommandPropMap;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column()
  public type: CommandType;

  @Column({
    name: 'data'
  })
  protected dataStr: string;

  constructor() {
    this.data = new Map();
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
      type: this.type
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

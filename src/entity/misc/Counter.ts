import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface CounterOptions {
  count: number;
  name: string;
  roomId: string;
}

@Entity()
export class Counter implements CounterOptions {
  public static create(options: CounterOptions) {
    const ctx = new Counter();
    ctx.count = options.count;
    ctx.name = options.name;
    ctx.roomId = options.roomId;
    return ctx;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public count: number;

  @Column()
  public name: string;

  @Column()
  public roomId: string;

  public toJSON() {
    return {
      count: this.count,
      id: this.id,
      name: this.name,
      roomId: this.roomId,
    };
  }
}

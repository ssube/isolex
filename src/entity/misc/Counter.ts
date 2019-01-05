import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { doesExist } from 'src/utils';

export interface CounterOptions {
  count: number;
  name: string;
  roomId: string;
}

export const TABLE_COUNTER = 'counter';

@Entity(TABLE_COUNTER)
export class Counter implements CounterOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string = '';

  @Column()
  public count: number = 0;

  @Column()
  public name: string = '';

  @Column()
  public roomId: string = '';

  constructor(options: CounterOptions) {
    if (doesExist(options)) {
      this.count = options.count;
      this.name = options.name;
      this.roomId = options.roomId;
    }
  }

  public toJSON() {
    return {
      count: this.count,
      id: this.id,
      name: this.name,
      roomId: this.roomId,
    };
  }
}

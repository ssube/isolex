import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';

export interface UserOptions {
  name: string;
  roles: Array<string>;
}

@Entity()
export class User extends BaseEntity implements UserOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column('simple-array')
  public roles: Array<string>;

  constructor(options?: UserOptions) {
    super();

    if (options) {
      this.name = options.name;
      this.roles = Array.from(options.roles);
    }
  }

  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      roles: Array.from(this.roles),
    };
  }
}

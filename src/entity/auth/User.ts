import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';

export interface UserOptions {
  name: string;
  roles: Array<string>;
}

@Entity()
export class User extends BaseEntity implements UserOptions {
  public static create(options: UserOptions) {
    const ctx = new User();
    ctx.name = options.name;
    ctx.roles = Array.from(options.roles);
    return ctx;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column('simple-array')
  public roles: Array<string>;

  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      roles: Array.from(this.roles),
    };
  }
}

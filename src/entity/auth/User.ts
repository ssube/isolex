import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface UserOptions {
  name: string;
  roles: Array<string>;
}

@Entity()
export class User implements UserOptions {
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
}

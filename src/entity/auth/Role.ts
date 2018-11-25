import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface RoleOptions {
  name: string;
  grants: Array<string>;
}

@Entity()
export class Role implements RoleOptions {
  public static create(options: RoleOptions) {
    const ctx = new Role();
    ctx.grants = Array.from(options.grants);
    ctx.name = options.name;
    return ctx;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column('simple-array')
  public grants: Array<string>;
}

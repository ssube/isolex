import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';

import { Role } from './Role';

export interface UserOptions {
  name: string;
  roles: Array<Role>;
}

@Entity()
export class User extends BaseEntity implements UserOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    unique: true,
  })
  public name: string;

  @Column({
    name: 'roles',
    type: 'simple-json',
  })
  public roleNames: Array<string>;

  public roles: Array<Role>;

  constructor(options?: UserOptions) {
    super();

    if (options) {
      this.name = options.name;
      this.roles = Array.from(options.roles);
      this.syncRoles();
    }
  }

  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      roles: this.roleNames,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  protected syncRoles() {
    this.roleNames = this.roles.map((it) => it.name);
  }
}

import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { doesExist } from '../../utils';

export interface BaseEntityOptions {
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class BaseEntity implements BaseEntityOptions {
  @CreateDateColumn()
  public createdAt: Date = new Date();

  @UpdateDateColumn()
  public updatedAt: Date = new Date();

  constructor(options: BaseEntityOptions) {
    if (doesExist(options)) {
      if (doesExist(options.createdAt)) {
        this.createdAt = options.createdAt;
      }
      if (doesExist(options.updatedAt)) {
        this.updatedAt = options.updatedAt;
      }
    }
  }

  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

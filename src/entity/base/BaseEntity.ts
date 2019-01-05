import { isNil } from 'lodash';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
    if (!isNil(options)) {
      if (!isNil(options.createdAt)) {
        this.createdAt = options.createdAt;
      }
      if (!isNil(options.updatedAt)) {
        this.updatedAt = options.updatedAt;
      }
    }
  }

  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

import { doesExist } from '@apextoaster/js-utils';
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
    if (doesExist(options)) {
      if (doesExist(options.createdAt)) {
        this.createdAt = options.createdAt;
      }
      if (doesExist(options.updatedAt)) {
        this.updatedAt = options.updatedAt;
      }
    }
  }

  /* eslint-disable-next-line @typescript-eslint/ban-types */
  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

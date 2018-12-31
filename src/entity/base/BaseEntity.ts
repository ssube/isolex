import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

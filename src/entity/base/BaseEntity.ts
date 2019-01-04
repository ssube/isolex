import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn()
  public createdAt: Date = new Date();

  @UpdateDateColumn()
  public updatedAt: Date = new Date();

  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

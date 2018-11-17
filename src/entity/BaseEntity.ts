export abstract class BaseEntity {
  public abstract toJSON(): any;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
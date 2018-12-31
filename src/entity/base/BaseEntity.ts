export abstract class BaseEntity {
  public abstract toJSON(): object;

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

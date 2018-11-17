export class BaseError extends Error {
  public message: string;
  public stack: string | undefined;
  protected nested: Array<Error>;

  constructor(message: string, ...nested: Array<Error>) {
    super(message);

    this.message = message;
    this.nested = nested;
    this.stack = nested.reduce((cur, err, idx) => {
      const indented = (err.stack || '').replace('\n', '\n  ');
      return `${cur}\n  caused by (${idx + 1}/${nested.length}):\n    ${indented}`;
    }, this.stack);
  }

  get length() {
    return this.nested.length;
  }
}

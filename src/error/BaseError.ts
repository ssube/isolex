export class BaseError extends Error {
  public message: string;
  public stack?: string;
  protected nested: Array<Error>;

  constructor(message: string, ...nested: Array<Error>) {
    super(message);

    this.message = message;
    this.nested = nested;
    this.stack = nested.reduce((cur, err, idx) => {
      const substack = err.stack || '';
      const frame = `\ncaused by (${idx + 1}/${nested.length}):\n${substack}`;
      const indented = frame.replace('\n', '\n  ');
      return `${cur}\n${indented}`;
    }, this.stack);
  }

  get length() {
    return this.nested.length;
  }
}

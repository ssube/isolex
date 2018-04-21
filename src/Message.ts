export class Message {
  public readonly body: string;

  constructor(options: {body: string}) {
    this.body = options.body;
  }
}
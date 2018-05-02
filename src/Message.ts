import * as escape from 'escape-html';
import { Context } from 'src/Context';

export interface MessageOptions {
  body: string;
  context: Context;
  reactions: Array<string>;
}

export class Message implements MessageOptions {
  public readonly body: string;
  public readonly context: Context;
  public readonly reactions: Array<string>;

  constructor(options: MessageOptions) {
    this.body = options.body;
    this.context = options.context;
    this.reactions = Array.from(options.reactions);
  }

  get escaped(): string {
    return escape(this.body);
  }
}

import * as escape from 'escape-html';
import { Context } from 'src/Context';

export interface MessageOptions {
  body: string;
  context: Context;
}

export class Message {
  public readonly body: string;
  public readonly context: Context;

  constructor(options: MessageOptions) {
    this.body = options.body;
    this.context = options.context;
  }

  get escaped(): string {
    return escape(this.body);
  }
}

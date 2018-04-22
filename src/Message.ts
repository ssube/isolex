import * as escape from 'escape-html';
import { Destination } from 'src/Destination';

export interface MessageOptions {
  body: string;
  dest: Destination;
}

export class Message {
  public readonly body: string;
  public readonly dest: Destination;

  constructor(options: MessageOptions) {
    this.body = options.body;
    this.dest = options.dest;
  }

  get escaped(): string {
    return escape(this.body);
  }
}

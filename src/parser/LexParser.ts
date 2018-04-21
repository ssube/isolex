import * as AWS from 'aws-sdk';
import { Event, MessagePosted } from 'vendor/so-client/src/events';
import { Command, CommandType } from 'src/command/Command';
import { Parser } from 'src/parser/Parser';

export interface LexParserOptions {
  account: {
    accessKey: string;
    secretKey: string;
  };
}

export class LexParser implements Parser {
  public static padUserId(id: number): string {
    const fixed = id.toFixed(0);
    if (fixed.length < 8) {
      const pre = Array(8 - fixed.length).fill('0').join('');
      return `${pre}${fixed}`;
    } else {
      return fixed;
    }
  }

  protected creds: AWS.Credentials;
  protected lex: AWS.LexRuntime;
  protected name: string;
  protected alias: string;

  constructor(options: LexParserOptions) {
    this.creds = new AWS.Credentials(options.account.accessKey, options.account.secretKey);
    this.lex = new AWS.LexRuntime({
      credentials: this.creds,
      region: 'us-east-1'
    });
  }

  protected postText(params: AWS.LexRuntime.PostTextRequest): Promise<AWS.LexRuntime.PostTextResponse> {
    return new Promise((res, rej) => {
      this.lex.postText(params, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    });
  }

  public async match(event: MessagePosted): Promise<boolean> {
    return event.event_type === 1;
  }

  public async parse(event: MessagePosted): Promise<Command> {
    const reply = await this.postText({
      botAlias: this.alias,
      botName: this.name,
      inputText: event.content,
      userId: LexParser.padUserId(event.user_id)
    });

    // turn reply into a command
    return new Command({
      data: new Map(),
      name: '',
      type: CommandType.None
    });
  }
}
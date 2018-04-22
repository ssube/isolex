import * as AWS from 'aws-sdk';
import * as bunyan from 'bunyan';
import { Event, MessagePosted } from 'vendor/so-client/src/events';
import { Bot } from 'src/Bot';
import { Command, CommandType } from 'src/command/Command';
import { Parser } from 'src/parser/Parser';

export interface LexParserConfig {
  account: {
    accessKey: string;
    secretKey: string;
  };
  bot: {
    alias: string;
    name: string;
  };
  region: string;
  tags: Array<string>;
}

export interface LexParserOptions {
  bot: Bot;
  config: LexParserConfig;
  logger: bunyan;
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

  protected alias: string;
  protected creds: AWS.Credentials;
  protected lex: AWS.LexRuntime;
  protected logger: bunyan;
  protected name: string;
  protected tags: Array<string>;

  constructor(options: LexParserOptions) {
    this.logger = options.logger.child({
      class: LexParser.name
    });
    this.logger.debug(options, 'creating lex parser');

    this.alias = options.config.bot.alias;
    this.name = options.config.bot.name;
    this.tags = options.config.tags;

    // aws
    this.creds = new AWS.Credentials(options.config.account.accessKey, options.config.account.secretKey);
    this.lex = new AWS.LexRuntime({
      credentials: this.creds,
      region: options.config.region
    });
  }

  public async match(event: MessagePosted): Promise<boolean> {
    if (event.event_type === 1) {
      for (const t of this.tags) {
        if (event.content.includes(t)) {
          return true;
        }
      }
    }
    
    return false;
  }

  public async parse(event: MessagePosted): Promise<Command> {
    const reply = await this.postText({
      botAlias: this.alias,
      botName: this.name,
      inputText: event.content,
      userId: LexParser.padUserId(event.user_id)
    });

    const intent = reply.intentName || 'none';
    this.logger.debug({intent, reply}, 'lex parsed message');

    // turn reply into a command
    return new Command({
      data: new Map(),
      from: {
        roomId: event.room_id.toString(),
        userId: event.user_id.toString(),
        userName: event.user_name
      },
      name: intent,
      type: CommandType.None
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
}

import * as AWS from 'aws-sdk';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command, CommandOptions, CommandType } from 'src/Command';
import { Message } from 'src/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';
import { leftPad } from 'src/utils';

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
  logger: Logger;
}

export class LexParser extends BaseParser implements Parser {
  protected alias: string;
  protected creds: AWS.Credentials;
  protected lex: AWS.LexRuntime;
  protected logger: Logger;
  protected name: string;
  protected tags: Array<string>;

  constructor(options: LexParserOptions) {
    super();
    this.logger = options.logger.child({
      class: LexParser.name
    });

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

  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const reply = await this.postText({
      botAlias: this.alias,
      botName: this.name,
      inputText: body,
      userId: leftPad(msg.context.userId)
    });

    const name = reply.intentName || 'none';
    this.logger.debug({ msg, name, reply }, 'lex parsed message');

    // merge lex reply and slots
    const data = { ...reply, ...reply.slots };
    const cmdOptions: CommandOptions = {
      context: msg.context,
      data,
      name,
      type: CommandType.None
    };

    this.logger.debug({ cmdOptions }, 'command options');
    return [new Command(cmdOptions)];
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

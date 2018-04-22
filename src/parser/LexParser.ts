import * as AWS from 'aws-sdk';
import * as bunyan from 'bunyan';
import { clone } from 'lodash';
import { Bot } from 'src/Bot';
import { Command, CommandOptions, CommandType } from 'src/command/Command';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser } from 'src/parser/Parser';
import { getEventDest, isEventMessage, leftPad } from 'src/utils';
import { Event } from 'vendor/so-client/src/events';

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

export class LexParser extends BaseParser implements Parser {
  protected alias: string;
  protected creds: AWS.Credentials;
  protected lex: AWS.LexRuntime;
  protected logger: bunyan;
  protected name: string;
  protected tags: Array<string>;

  constructor(options: LexParserOptions) {
    super();
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

  public async parse(event: Event): Promise<Command> {
    if (!isEventMessage(event)) {
      throw new Error('invalid event type');
    }

    const body = this.removeTags(event.content);
    const reply = await this.postText({
      botAlias: this.alias,
      botName: this.name,
      inputText: body,
      userId: leftPad(event.user_id.toString())
    });

    const intent = reply.intentName || 'none';
    this.logger.debug({event, intent, reply}, 'lex parsed message');

    const cmdOptions: CommandOptions = {
      data: reply,
      from: getEventDest(event),
      name: intent,
      type: CommandType.None
    };

    this.logger.debug({cmdOptions}, 'command options');
    return new Command(cmdOptions);
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

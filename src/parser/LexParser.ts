import * as AWS from 'aws-sdk';
import { Command, CommandOptions, CommandType } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { leftPad } from 'src/utils';

export interface LexParserConfig extends ParserConfig {
  account: {
    accessKey: string;
    secretKey: string;
  };
  bot: {
    alias: string;
    name: string;
  };
  region: string;
}

export type LexParserOptions = ServiceOptions<LexParserConfig>;

export class LexParser extends BaseParser<LexParserConfig> implements Parser {
  protected alias: string;
  protected creds: AWS.Credentials;
  protected lex: AWS.LexRuntime;

  constructor(options: LexParserOptions) {
    super(options);

    this.alias = options.config.bot.alias;

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
      botAlias: this.config.bot.alias,
      botName: this.config.bot.name,
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
    return [Command.create(cmdOptions)];
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

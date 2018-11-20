import * as AWS from 'aws-sdk';
import { isString } from 'lodash';

import { Command, CommandOptions } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';
import { leftPad, MapOrMapLike } from 'src/utils';

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

    this.alias = options.data.bot.alias;

    // aws
    this.creds = new AWS.Credentials(options.data.account.accessKey, options.data.account.secretKey);
    this.lex = new AWS.LexRuntime({
      credentials: this.creds,
      region: options.data.region,
    });
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  public async parse(msg: Message): Promise<Array<Command>> {
    const { data, noun } = await this.decode(msg);
    const cmdOptions: CommandOptions = {
      context: msg.context,
      data,
      noun,
      verb: this.data.emit.verb,
    };

    this.logger.debug({ cmdOptions }, 'command options');
    return [Command.create(cmdOptions)];
  }

  public async decode(msg: Message): Promise<any> {
    if (!isString(msg.body)) {
      throw new InvalidArgumentError('message body must be a string');
    }

    const body = this.removeTags(msg.body);
    const post = await this.postText({
      botAlias: this.data.bot.alias,
      botName: this.data.bot.name,
      inputText: body,
      userId: leftPad(msg.context.userId),
    });

    this.logger.debug({ body, msg, post }, 'lex parsed message');

    const noun = post.intentName;
    if (!noun) {
      this.logger.warn({ msg }, 'lex parsed message without intent');
      return [];
    }

    // merge lex reply and slots
    return {
      data: this.getSlots(post.slots),
      noun,
    };
  }

  protected getSlots(input: AWS.LexRuntime.StringMap | undefined): MapOrMapLike<Array<string>> {
    const slots = new Map();
    if (input) {
      for (const [k, v] of Object.entries(input)) {
        slots.set(k, v);
      }
    }
    return slots;
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

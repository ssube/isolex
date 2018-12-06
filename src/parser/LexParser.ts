import * as AWS from 'aws-sdk';

import { Command, CommandDataValue, CommandOptions } from 'src/entity/Command';
import { Context } from 'src/entity/Context';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserData, ParserOptions } from 'src/parser/Parser';
import { leftPad } from 'src/utils';
import { TYPE_TEXT } from 'src/utils/Mime';

export interface LexParserData extends ParserData {
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

export type LexParserOptions = ParserOptions<LexParserData>;

export class LexParser extends BaseParser<LexParserData> implements Parser {
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

  /**
   * @TODO: decode values with Lex
   *
   * Lex uses stateful (session-based) completion and keeps track of the next slot to be filled. Values must be sent
   * to Lex to be decoded, in order to update state and otherwise behave correctly. This should probably synthesize a
   * message that will use the same Lex session-state and re-parse that.
   */
  public async complete(context: Context, fragment: Fragment, value: CommandDataValue): Promise<Array<Command>> {
    throw new NotImplementedError();
  }

  /**
   * @TODO: split the Lex intent into noun and verb
   */
  public async parse(msg: Message): Promise<Array<Command>> {
    const { data, noun } = await this.decode(msg);
    const cmdOptions: CommandOptions = {
      context: msg.context,
      data,
      labels: this.data.emit.labels,
      noun,
      verb: this.data.emit.verb,
    };

    this.logger.debug({ cmdOptions }, 'command options');
    return [new Command(cmdOptions)];
  }

  public async decode(msg: Message): Promise<any> {
    if (msg.type !== TYPE_TEXT) {
      throw new InvalidArgumentError(`lex parser can only decode ${TYPE_TEXT} messages`);
    }

    const post = await this.postText({
      botAlias: this.data.bot.alias,
      botName: this.data.bot.name,
      inputText: msg.body,
      userId: leftPad(msg.context.userId),
    });

    this.logger.debug({ msg, post }, 'lex parsed message');

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

  protected getSlots(input: AWS.LexRuntime.StringMap | undefined): Map<string, Array<string>> {
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
